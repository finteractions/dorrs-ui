import React from 'react';
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
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import downloadFile from "@/services/download-file/download-file";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import {getSymbolSourceTypeName, SymbolSourceType} from "@/enums/symbol-source-type";
import {ErrorMessage, Field, Form, Formik} from "formik";
import PendingSymbolForm from "@/components/backend/pending-symbol-form";
import CompanyProfile from "@/components/company-profile-form";
import {PaymentSource} from "@/enums/payment-source";
import PaymentMethodStripeCreditDebitCardBlock from "@/components/payment-method-stripe-credit-debit-card-block";
import PaymentMethodStripeACHBlock from "@/components/payment-method-stripe-ach-block";
import PaymentMethodWireBlock from "@/components/payment-method-wire-block";
import PendingCompanyProfileForm from "@/components/backend/pending-company-profile-form";


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
    formSourceAction: string;
    data: ISymbol[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
    symbolSourceLoader: boolean
    symbolSourceData: [{ source: string, processing: boolean }] | [];
    isOpenCompanyModal: boolean;
    formCompanyData: ICompanyProfile | null;
    formAction: string;
    formCompanyAction: string;
    symbolLoaded: boolean;
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
            formAction: 'add',
            formSourceAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            showSymbolForm: true,
            success: false,
            symbolSourceLoader: false,
            symbolSourceData: [],
            isOpenCompanyModal: false,
            formCompanyData: null,
            formCompanyAction: 'add',
            symbolLoaded: false
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
            columnHelper.accessor((row) => row.source_name, {
                id: "source_name",
                cell: (item) => item.getValue(),
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
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()} changed`}>
                            {item.getValue().status}
                        </div>
                        {item.getValue().comment_status ?
                            <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon
                                className="nav-icon" icon={faComment}/></div> : ''}
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.company_profile_status, {
                id: "company_profile_status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Asset Profile Status</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
            columnHelper.accessor((row) => row.approved_date_time, {
                id: "approved_date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Approved Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'symbol', placeholder: 'Symbol'},
            {key: 'security_name', placeholder: 'Security Name'},
            {key: 'source_name', placeholder: 'Source'},
            {key: 'market_sector', placeholder: 'Market Sector'},
            {
                key: 'status',
                placeholder: 'Status',
                type: 'multiSelect',
                condition: {
                    values: {
                        'Pending': 'Pending',
                        'Submitted': 'Submitted',
                        'Approved': 'Approved',
                        'Rejected': 'Rejected',
                    },
                    isClearable: true,
                    isSearchable: true,
                    selected: 'Pending,Submitted',
                    condition: {}
                }
            },
            {key: 'company_profile_status', placeholder: 'Asset Profile Status'},
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
        return new Promise(resolve => {
            adminService.getPendingAssets()
                .then((res: ISymbol[]) => {
                    let data = res?.sort((a, b) => {
                        return Date.parse(b.created_at) - Date.parse(a.created_at);
                    }) || [];
                    data.forEach(s => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                        s.viewDisabled = s.status.toLowerCase() === 'pending';
                        s.source_name = getSymbolSourceTypeName(s.source as SymbolSourceType)
                        if (s.company_profile && s.company_profile?.status) {
                            s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                        }
                        s.company_profile_status = s.company_profile?.status ? s.company_profile.status : '-';
                        s.isAdmin = true;
                    })

                    this.setState({data: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    this.setState({loading: false})
                    resolve(true);
                });
        });
    }

    startAutoUpdate(): void {
        this.getAssetsInterval = setInterval(this.getAssets, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval as number);
    }

    openModal = (mode: string, data?: ISymbol) => {
        this.setState({
            isOpenModal: true,
            formData: data || null,
            formCompanyData: data?.company_profile || null,
            formAction: mode,
            modalTitle: this.modalTitle(mode),
            symbolLoaded: false
        })
        this.cancelSourceForm();
    }

    openSourceModal = () => {
        this.setState({isOpenSourceModal: true})
        this.cancelForm();
        this.cancelCompanyForm();
    }

    openCompanyModal = (mode: string, data?: ICompanyProfile | null) => {
        this.setState({
            isOpenCompanyModal: true,
            formCompanyData: data || null,
            formCompanyAction: mode,
            modalTitle: this.modalTitle(mode)
        })
        this.cancelSourceForm();
        this.cancelForm();
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to delete this pending symbol?';
        } else if (mode === 'view') {
            return 'View Symbol'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'}`;
        }
    }

    cancelSourceForm(): void {
        this.setState({isOpenSourceModal: false});
    }

    cancelForm(): void {
        this.setState({isOpenModal: false, formData: null, formCompanyData: null});
    }

    submitForm(isCloseModal = false): void {
        if (isCloseModal) {
            this.cancelForm();
        }
        this.getAssets()
            .then(() => {
                if (!isCloseModal) {
                    setTimeout(() => {
                        const symbolId = this.state?.formData?.id;
                        if (symbolId) {
                            const symbolNew = this.state.data.find(s => s.id === symbolId);
                            this.setState({formData: symbolNew}, () => {
                                const modalOverlay = document.querySelector('.modal-overlay.active');
                                if (modalOverlay) {
                                    modalOverlay.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            })
                        }
                    })
                }
            })
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

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Asset Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset Profile`;
        }
    }

    cancelCompanyForm(): void {
        this.setState({isOpenCompanyModal: false});
    }

    onLoading = () => {
        this.setState({symbolLoaded: true});
    }

    isAssetProfileDisabled = () => {
        return this.state.formData?.status === 'Pending'
    }

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
                                               viewBtn={true}
                                               editBtn={true}
                                               deleteBtn={true}
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
                       isDisabled={!this.state.symbolLoaded}
                       title={this.modalTitle(this.state.formAction)}
                >
                    <div className={''}>
                        {this.state.formAction !== 'delete' && (
                            <ul className="nav nav-tabs" id="tabs">
                                <li className="nav-item">
                                    <a
                                        className="nav-link active"
                                        id="symbol-tab"
                                        data-bs-toggle="tab"
                                        href="#symbol"
                                        role="tab"
                                        aria-controls="symbol"
                                        aria-selected="true"
                                    >
                                        Symbol
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${this.isAssetProfileDisabled() ? 'disabled' : ''}`}
                                        id="asset-profile-tab"
                                        data-bs-toggle={this.isAssetProfileDisabled() ? undefined : 'tab'}
                                        href={this.isAssetProfileDisabled() ? undefined : '#asset-profile'}
                                        role="tab"
                                        aria-controls="asset-profile"
                                        aria-selected="false"
                                        aria-disabled={this.isAssetProfileDisabled() ? 'true' : 'false'}
                                        tabIndex={this.isAssetProfileDisabled() ? -1 : 0}
                                        onClick={(e) => {
                                            if (this.isAssetProfileDisabled()) e.preventDefault();
                                        }}
                                    >
                                        Asset Profile
                                    </a>

                                </li>
                            </ul>
                        )}

                        <div className="tab-content mt-4">
                            <div
                                className="tab-pane fade show active"
                                id="symbol"
                                role="tabpanel"
                                aria-labelledby="symbol-tab"
                            >

                                <PendingSymbolForm action={this.state.formAction}
                                                   data={this.state.formData}
                                                   onCancel={() => this.cancelForm()}
                                                   onCallback={(flag:boolean) => this.submitForm(flag)}
                                                   onLoading={() => this.onLoading()}
                                                   isAdmin={true}/>
                            </div>
                            <div
                                className="tab-pane fade"
                                id="asset-profile"
                                role="tabpanel"
                                aria-labelledby="asset-profile-tab"
                            >
                                <PendingCompanyProfileForm action={this.state.formAction}
                                                           data={this.state.formCompanyData}
                                                           symbolData={this.state.formData}
                                                           onCancel={() => this.cancelCompanyForm()}
                                                           onCallback={() => this.submitForm()}
                                                           isAdmin={true}/>
                            </div>
                        </div>
                    </div>


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
