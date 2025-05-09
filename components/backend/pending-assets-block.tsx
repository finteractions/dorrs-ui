import React, {useEffect} from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import formatterService from "@/services/formatter/formatter-service";
import Modal from "@/components/modal";
import AssetImage from "@/components/asset-image";
import SymbolForm from "@/components/symbol-form";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import downloadFile from "@/services/download-file/download-file";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import {getSymbolSourceTypeName, SymbolSourceType} from "@/enums/symbol-source-type";
import {ErrorMessage, Field, Form, Formik} from "formik";
import PendingSymbolForm from "@/components/pending-symbol-form";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

const formSchema = Yup.object().shape({
    source_type: Yup.array()
        .of(Yup.string().oneOf(Object.values(SymbolSourceType)))
        .min(1, 'Choose at least one source')
        .required('Required'),
});

let initialValues: { source_type: SymbolSourceType[] } = {
    source_type: []
};

interface PendingAssetsBlockState extends IState {
    loading: boolean;
    isOpenModal: boolean;
    isOpenSourceModal: boolean;
    formData: ISymbol | null;
    formCompanyData: ICompanyProfile | null;
    formAction: string;
    formSourceAction: string;
    data: ISymbol[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
    symbolSourceLoader: boolean
    symbolSourceData: [{ source: string, processing: boolean }] | [];
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class PendingAssetsBlock extends React.Component<{}> {
    state: PendingAssetsBlockState;
    getAssetsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            isOpenSourceModal: false,
            formData: null,
            formCompanyData: null,
            formAction: 'add',
            formSourceAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            showSymbolForm: true,
            success: false,
            symbolSourceLoader: false,
            symbolSourceData: []
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol,
                company_profile: row.company_profile,
                formData: row,
                name_label: row.company_profile?.security_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div
                        className={`table-image`}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        width={28} height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.security_name, {
                id: "security_name",
                cell: (item) => item.getValue(),
                header: () => <span>Security Name </span>,
            }),
            columnHelper.accessor((row) => row.source, {
                id: "source",
                cell: (item) => getSymbolSourceTypeName(item.getValue()),
                header: () => <span>Source </span>,
            }),
            columnHelper.accessor((row) => row.market_sector, {
                id: "market_sector",
                cell: (item) => item.getValue(),
                header: () => <span>Market Sector </span>,
            }),
            columnHelper.accessor((row) => ({
                comment_status: row.reason_change_status || row.reason_delete_status,
                comment: row.reason_change || row.reason_delete,
                status: row.status
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().status}
                        </div>
                        {item.getValue().comment_status ?
                            <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon
                                className="nav-icon" icon={faComment}/></div> : ''}
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'symbol', placeholder: 'Symbol'},
            {key: 'security_name', placeholder: 'Security Name'},
            {key: 'source_name', placeholder: 'Source'},
            {key: 'market_sector', placeholder: 'Market Sector'},
            {key: 'status', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getAssets();
        // this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getAssets = () => {
        adminService.getPendingAssets()
            .then((res: ISymbol[]) => {
                let data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];
                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.source_name = getSymbolSourceTypeName(s.source as SymbolSourceType)
                    s.isAdmin = true;
                })

                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    startAutoUpdate(): void {
        this.getAssetsInterval = setInterval(this.getAssets, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval as number);
    }

    openModal = (mode: string, data?: IAdminAsset) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
        this.cancelSourceForm();
    }

    openSourceModal = () => {
        this.setState({isOpenSourceModal: true})
        this.cancelForm();
    }

    openCompanyModal = (mode: string, data?: ICompanyProfile | null) => {
        this.setState({
            isOpenSourceModal: true,
            formCompanyData: data || null,
            formSourceAction: mode,
            modalTitle: this.modalTitle(mode)
        })
        this.cancelForm();
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to delete this symbol?';
        } else if (mode === 'view') {
            return 'View Symbol'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Symbol`;
        }
    }


    cancelSourceForm(): void {
        this.setState({isOpenSourceModal: false});
    }

    cancelForm(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false, isOpenSourceModal: false});
        this.getAssets();
    }

    downloadSymbolsCSV = () => {
        if (this.tableRef.current) {
            adminService.downloadSymbols(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('symbols', res);
            })
        }
    }

    downloadSymbolsXLSX = () => {
        if (this.tableRef.current) {
            adminService.downloadSymbols(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('symbols', res);
            })
        }
    }

    handleSubmit = async (
        values: Record<string, string[]>,
        {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        this.setState({errorMessages: null});

        setSubmitting(true);
        this.setState({symbolSourceLoader: true});

        const sources = values.source_type;
        if (!Array.isArray(sources) || sources.length === 0) {
            setSubmitting(false);
            this.setState({symbolSourceLoader: false});
            return;
        }

        const symbolSourceData = sources.map((source) => ({
            source,
            processing: false,
        }));

        await new Promise<void>((resolve) => {
            this.setState({symbolSourceData}, resolve);
        });

        for (let i = 0; i < this.state.symbolSourceData.length; i++) {
            const currentSource = this.state.symbolSourceData[i];

            const updatedStart = this.state.symbolSourceData.map((item, index) =>
                index === i ? {...item, processing: true} : item
            );

            await new Promise<void>((resolve) => {
                this.setState({symbolSourceData: updatedStart}, resolve);
            });

            try {
                await adminService.getPendingAssetsProcessing({source: currentSource.source});
            } catch (error: any) {
            }

            const updatedDone = this.state.symbolSourceData.map((item, index) =>
                index === i ? {...item, processing: false} : item
            );

            await new Promise<void>((resolve) => {
                this.setState({symbolSourceData: updatedDone}, resolve);
            });
        }

        setSubmitting(false);
        this.setState({symbolSourceLoader: false});
        this.cancelSourceForm();
        this.getAssets();
    };


    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Pending Symbols</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <button className="border-btn ripple modal-link"
                                    disabled={this.state.loading} onClick={() => this.openSourceModal()}>Load Symbol
                                List
                            </button>
                        </div>

                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.data.length ? (
                                        <Table columns={columns}
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={true}
                                               deleteBtn={false}
                                               filters={tableFilters}
                                               ref={this.tableRef}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No pending symbols available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal}
                       className={this.state.formAction !== 'delete' ? `big_modal` : ``}
                       onClose={() => this.cancelForm()}
                       title={this.modalTitle(this.state.formAction)}
                >
                    {(this.state.formAction === 'view') && (
                        <div className="modal__navigate">
                            <div className="modal__navigate__title">Asset Profile:</div>

                            {this.state.formData?.company_profile ? (
                                <>
                                    <div
                                        className={`table__status table__status-${this.state.formData?.company_profile?.status.toLowerCase()}`}>{this.state.formData?.company_profile?.status}</div>
                                    <button className={'border-btn ripple'}
                                            onClick={() => this.openCompanyModal('view', this.state.formData?.company_profile)}>
                                        View
                                    </button>
                                    <button className={'border-btn ripple'}
                                            onClick={() => this.openCompanyModal('edit', this.state.formData?.company_profile)}>
                                        Edit
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className={'border-btn ripple'}
                                            onClick={() => this.openCompanyModal('add')}>
                                        Add
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <PendingSymbolForm action={this.state.formAction}
                                data={this.state.formData}
                                onCancel={() => this.cancelForm()}
                                onCallback={() => this.submitForm()}
                                isAdmin={true}/>
                </Modal>

                <Modal isOpen={this.state.isOpenSourceModal}
                       isDisabled={this.state.symbolSourceLoader}
                       onClose={() => this.cancelSourceForm()}
                       title={'Load Symbols from source'}
                >
                    <Formik
                        initialValues={initialValues}
                        validationSchema={formSchema}
                        onSubmit={this.handleSubmit}
                    >
                        {({isSubmitting, isValid, values, setFieldValue, dirty, errors}) => {
                            return (
                                <>
                                    <Form>
                                        {Object.values(SymbolSourceType).map((type) => {
                                            const processing = this.state.symbolSourceData.find(s => s.source === type)?.processing;

                                            return (
                                                <React.Fragment key={type}>
                                                    <div className="input">
                                                        <div
                                                            className={`b-checkbox b-checkbox${isSubmitting ? ' disable' : ''}`}>
                                                            <Field
                                                                type="checkbox"
                                                                name="source_type"
                                                                id={`source_type_${type}`}
                                                                checked={values.source_type.includes(type)}
                                                                disabled={isSubmitting || [SymbolSourceType.INX, SymbolSourceType.FORGE_GLOBAL].includes(type)}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const isChecked = e.target.checked;
                                                                    const newValue = isChecked
                                                                        ? [...values.source_type, type]
                                                                        : values.source_type.filter((v) => v !== type);
                                                                    setFieldValue("source_type", newValue);
                                                                }}
                                                            />
                                                            <label htmlFor={`source_type_${type}`}>
                                                                <span></span>
                                                                <i>{getSymbolSourceTypeName(type)}</i>
                                                                {processing &&
                                                                    <LoaderBlock className={'small'} height={16}
                                                                                 width={16}/>}
                                                            </label>
                                                            <ErrorMessage name="is_enable" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}

                                        <button id="add-bank-acc"
                                                className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                            Submit
                                        </button>

                                        {this.state.errorMessages && (
                                            <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                        )}
                                    </Form>
                                </>
                            );
                        }}
                    </Formik>
                </Modal>
            </>
        )
    }
}

export default PendingAssetsBlock;
