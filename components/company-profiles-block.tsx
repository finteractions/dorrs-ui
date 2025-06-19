import React from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import {UsaStates} from "usa-states";
import {createColumnHelper} from "@tanstack/react-table";
import AssetImage from "@/components/asset-image";
import filterService from "@/services/filter/filter";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import {countries} from "countries-list";
import formatterService from "@/services/formatter/formatter-service";
import adminService from "@/services/admin/admin-service";
import CompanyProfileForm from "@/components/company-profile-form";
import Modal from "@/components/modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilter, faPlus} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import SymbolForm from "@/components/symbol-form";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {ISymbol} from "@/interfaces/i-symbol";
import Select from "react-select";
import DoughnutChartPercentage from "@/components/chart/doughnut-chart-percentage";
import * as Yup from "yup";
import Image from "next/image";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";


interface CompanyProfilesBlockState extends IState {
    isLoading: boolean;
    isSymbolLoading: boolean;
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    data: ICompanyProfile[];
    dataFull: ICompanyProfile[];
    filterData: any;
    isAdmin: boolean,
    isOpenCompanyModal: boolean;
    formCompanyData: ICompanyProfile | null;
    formCompanyAction: string;
    isFilterShow: boolean;
    filtersClassName: string;
    isOpenModal: boolean;
    formAction: string;
    formType: string;
    symbol: ISymbol | null;
    companyProfile: ICompanyProfile | null;
    isOverrideComponent: boolean;
}

interface CompanyProfilesBlockProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    },
    isAdmin?: boolean;
}

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required'),
});

let initialValues = {} as ISymbol;

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class CompanyProfilesBlock extends React.Component<CompanyProfilesBlockProps, CompanyProfilesBlockState> {

    host = `${window.location.protocol}//${window.location.host}`;
    state: CompanyProfilesBlockState;
    symbols: Array<ISymbol> = new Array<ISymbol>();

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: CompanyProfilesBlockProps, context: IDataContext<null>) {
        super(props);

        this.context = context;

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.state = {
            success: false,
            isLoading: true,
            isSymbolLoading: true,
            usaStates: usaStatesList,
            data: [],
            dataFull: [],
            filterData: [],
            isAdmin: props.isAdmin ?? false,
            isOpenCompanyModal: false,
            formCompanyData: null,
            formCompanyAction: 'add',
            isFilterShow: false,
            filtersClassName: props.isAdmin ? '' : 'd-none d-md-flex',
            isOpenModal: false,
            formAction: '',
            companyProfile: null,
            formType: '',
            symbol: null,
            isOverrideComponent: true,
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                company_name: row.company_name,
                symbol_name: row.symbol_name,
                image: row.logo
            }), {
                id: "company_name",
                cell: (item) =>
                    <div onClick={() => {
                        this.navigate(item.getValue().symbol_name)
                    }}
                         className={`table-image text-overflow ${!this.state.isAdmin ? 'cursor-pointer link' : ''}`}
                    >
                        <div className="table-image-container ">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        height={28}/>
                        </div>
                        {item.getValue().company_name}
                    </div>
                ,
                header: () => <span>Company Name</span>,
            }),

            columnHelper.accessor((row) => row.business_description, {
                id: "business_description",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>Business Description </span>,
            }),

            columnHelper.accessor((row) => row.sic_industry_classification, {
                id: "sic_industry_classification",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>SIC Industry Classification </span>,
            }),

            columnHelper.accessor((row) => row.incorporation_information, {
                id: "incorporation_information",
                cell: (item) => this.state.usaStates.filter(currency => currency.abbreviation === item.getValue()).map(filteredState => (
                    <React.Fragment key={filteredState.abbreviation}>
                        {filteredState.name} ({filteredState.abbreviation})
                    </React.Fragment>
                )),
                header: () => <span>Incorporation Information </span>,
            }),

            columnHelper.accessor((row) => row.number_of_employees, {
                id: "number_of_employees",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 0)}</span>,
                header: () => <span>Number of Employees </span>,
            }),

            columnHelper.accessor((row) => row.country, {
                id: "country",
                cell: (item) => countries[item.getValue() as keyof typeof countries]?.name,
                header: () => <span>Country </span>,
            }),
            columnHelper.accessor((row) => row.state, {
                id: "state",
                cell: (item) => this.state.usaStates.filter(currency => currency.abbreviation === item.getValue()).map(filteredState => (
                    <React.Fragment key={filteredState.abbreviation}>
                        {filteredState.name} ({filteredState.abbreviation})
                    </React.Fragment>
                )),
                header: () => <span>State </span>,
            }),
            columnHelper.accessor((row) => row.company_profile_status, {
                id: "company_profile_status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.fill_out_percentage, {
                id: "fill_out_percentage",
                cell: (item) =>
                    <div className={'d-flex justify-content-center'}>
                        {parseInt(item.getValue()) === 100 ? (
                            <Image src="/img/check-ok.svg" width={28} height={42} alt="Check"/>
                        ) : (
                            <DoughnutChartPercentage
                                percentage={item.getValue()}
                                width={40}
                                height={40}
                                fontSize={12}
                                isAdmin={this.state.isAdmin}
                            />
                        )}
                    </div>
                ,
                header: () => <span></span>,
            }),
        ];

        tableFilters = [
            {key: 'company_name', placeholder: 'Company Name'},
            {key: 'sic_industry_classification', placeholder: 'SIC Industry Classification'},
            {key: 'company_profile_status', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getCompanyProfiles();
        this.getSymbols();
    }

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    getCompanyProfiles = () => {
        const request: Promise<Array<ICompanyProfile>> = this.props.isAdmin ? adminService.getCompanyProfile() : symbolService.getCompanyProfile();

        request
            .then((res: Array<ICompanyProfile>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.company_profile_status = s.status ? s.status : '-'
                })

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                let data = res || [];
                this.symbols = data
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isSymbolLoading: false});
            });
    }

    navigate = (symbol: string) => {
        this.props.onCallback(symbol, 'view');
    }

    onCallback = async (values: any, step: boolean) => {
        this.getCompanyProfiles();
        this.cancelCompanyForm();
        this.getSymbols();
        this.closeModal();
    };

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
    }

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    openModal = (mode: string, data?: ICompanyProfile) => {
        if (this.state.isAdmin) {
            this.setState({isOpenCompanyModal: true, formCompanyData: data || null, formCompanyAction: mode})
        } else {
            if (mode === 'delete') {
                this.setState({isOpenCompanyModal: true, formCompanyData: data || null, formCompanyAction: mode})
            } else if (mode === 'add') {
                this.props.onCallback(mode)
            } else {
                this.props.onCallback(data?.symbol_data?.symbol, mode)
            }
        }
    }

    openCompanyProfileModal = (form: string) => {
        this.setState({isOpenModal: true, formType: form});
    }

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

    modalTitle = () => {
        const add = 'Add';
        switch (this.state.formType) {
            case 'security':
                return `${add} View`;
            case 'company_profile':
                return `${add} Asset Profile`;
            default:
                return '';
        }
    }

    handleSubmit = async (values: ISymbol, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        if (this.state.isAdmin) {
            const symbol = this.symbols.find(s => s.symbol === values.symbol);
            this.setState({
                isOpenModal: true,
                symbol: symbol ?? null,
                companyProfile: symbol?.company_profile ?? null,
                isOverrideComponent: false,
                formAction: symbol?.company_profile ? 'edit' : 'add'
            });
        } else {
            this.context.setSharedData({symbol: values.symbol})
            this.props.onCallback('add')
        }

    };

    renderFormBasedOnType(formType: string) {
        switch (formType) {
            case 'security':
                return (
                    <SymbolForm
                        isAdmin={false}
                        action={this.state.formAction}
                        data={null}
                        onCallback={this.onCallback}
                    />
                );
            case 'company_profile':
                return (
                    this.state.isOverrideComponent ? (
                        <>
                            {this.state.isSymbolLoading ? (
                                <LoaderBlock/>
                            ) : (
                                <Formik<ISymbol>
                                    initialValues={initialValues}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({
                                          isSubmitting,
                                          setFieldValue,
                                          isValid,
                                          dirty,
                                          values,
                                          errors
                                      }) => {
                                        return (
                                            <Form>
                                                <div className="input">
                                                    <div className="input__title">Symbol <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                        <Field
                                                            name="symbol_tmp"
                                                            id="symbol_tmp"
                                                            as={Select}
                                                            className="b-select-search"
                                                            placeholder="Select Symbol"
                                                            classNamePrefix="select__react"
                                                            isDisabled={isSubmitting}
                                                            options={Object.values(this.symbols).map((item) => ({
                                                                value: item.symbol,
                                                                label: (
                                                                    <div className={'flex-panel-box'}>
                                                                        <div className={'panel'}>
                                                                            <div
                                                                                className={'content__bottom d-flex justify-content-between font-size-18'}>
                                                                                <div
                                                                                    className={'view_block_main_title'}>
                                                                                    <AssetImage alt=''
                                                                                                src={item.company_profile?.logo ? `${this.host}${item.company_profile?.logo}` : ''}
                                                                                                width={75} height={75}/>
                                                                                    {item.company_profile?.company_name || item.security_name} ({item.symbol})
                                                                                </div>
                                                                                <DoughnutChartPercentage
                                                                                    percentage={item.fill_out_percentage}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            }))}
                                                            onChange={(selectedOption: any) => {
                                                                setFieldValue('symbol', selectedOption.value);
                                                            }}
                                                        />
                                                        <Field type="hidden" name="symbol" id="symbol"/>
                                                        <ErrorMessage name="symbol" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                    type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                    Next
                                                </button>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            )}
                        </>
                    ) : (
                        <CompanyProfileForm
                            action={this.state.formAction}
                            data={this.state.companyProfile}
                            symbolData={this.state.symbol}
                            onCallback={this.onCallback}
                            isAdmin={false}
                        />
                    )
                );
            default:
                return null;
        }
    }

    closeModal(): void {
        this.setState({isOpenModal: false, formType: '', symbol: null, isOverrideComponent: true, formAction: ''});
    }

    render() {
        return (
            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Asset Profiles</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            {!this.state.isAdmin && (
                                <Button
                                    variant="link"
                                    className="d-md-none admin-table-btn ripple"
                                    type="button"
                                    onClick={() => this.handleShowFilters()}
                                >
                                    <FontAwesomeIcon icon={faFilter}/>
                                </Button>
                            )}

                            {this.props.access.create && (
                                <>
                                    {!this.state.isAdmin ? (
                                        <>
                                            <button className="d-none d-md-block b-btn ripple"
                                                    disabled={this.state.isLoading}
                                                    onClick={() => this.openCompanyProfileModal('company_profile')}>Add
                                                Asset Profile
                                            </button>
                                            <Button
                                                variant="link"
                                                className={'d-md-none admin-table-btn ripple'}
                                                type="button"
                                                onClick={() => this.openCompanyProfileModal('company_profile')}
                                            >
                                                <FontAwesomeIcon icon={faPlus}/>
                                            </Button>
                                        </>
                                    ) : (
                                        <button className="border-btn ripple modal-link"
                                                disabled={this.state.isLoading}
                                                onClick={() => this.openCompanyProfileModal('company_profile')}>Add
                                            Asset Profile
                                        </button>
                                    )}
                                </>

                            )}
                        </div>
                    </div>

                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__bottom">
                                {this.state.data.length ? (
                                    <Table columns={columns}
                                           pageLength={this.state.isAdmin ? pageLength : undefined}
                                           data={this.state.data}
                                           searchPanel={true}
                                           block={this}
                                           viewBtn={true}
                                           editBtn={true}
                                           filters={tableFilters}
                                           filtersClassName={this.state.filtersClassName}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}

                                <Modal isOpen={this.state.isOpenCompanyModal}
                                       className={'big_modal'}
                                       onClose={() => this.cancelCompanyForm()}
                                       title={this.modalCompanyTitle(this.state.formCompanyAction)}
                                >
                                    <CompanyProfileForm action={this.state.formCompanyAction}
                                                        data={this.state.formCompanyData}
                                                        symbolData={this.state.formCompanyData?.symbol_data || null}
                                                        onCallback={this.onCallback}
                                                        isAdmin={this.state.isAdmin}/>

                                </Modal>

                                <Modal isOpen={this.state.isOpenModal}
                                       onClose={() => this.closeModal()}
                                       title={this.modalTitle()}
                                       className={`${this.state.formAction !== '' ? 'big_modal' : ''}`}
                                >
                                    {this.renderFormBasedOnType(this.state.formType)}
                                </Modal>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }

}

export default CompanyProfilesBlock;
