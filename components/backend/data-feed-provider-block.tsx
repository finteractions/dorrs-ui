import React, {RefObject} from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import Link from "next/link";
import {Field, Form, Formik, FormikProps} from "formik";
import Select from "react-select";
import downloadFile from "@/services/download-file/download-file";
import formatterService from "@/services/formatter/formatter-service";


interface DataFeedProviderBlockState {
    isLoading: boolean;
    isDataLoading: boolean;
    data: IDataFeedProvider | null;
    errors: string[];
    defaultDate: string;
    selectedDate: string;
    users: Array<IDataFeedProviderUser>
}

interface DataFeedProviderBlockProps extends ICallback {
    name: string;
}


const columnUserDataHelper = createColumnHelper<any>();
let userDataColumns: any[] = [];
let userDataFilters: Array<ITableFilter> = []
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class DataFeedProviderBlock extends React.Component<DataFeedProviderBlockProps, DataFeedProviderBlockState> {
    state: DataFeedProviderBlockState;
    dates: Array<string>;
    formRef: RefObject<FormikProps<any>>;
    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: DataFeedProviderBlockProps) {
        super(props);

        this.state = {
            isLoading: true,
            isDataLoading: true,
            data: null,
            errors: [],
            defaultDate: '',
            selectedDate: '',
            users: []
        }

        this.dates = [];

        userDataColumns = [
            columnUserDataHelper.accessor((row) => row.user_name, {
                id: "user_name",
                cell: (item) => item.getValue(),
                header: () => <span>Name</span>,
            }),
            columnUserDataHelper.accessor((row) => row.email, {
                id: "email",
                cell: (item) => item.getValue(),
                header: () => <span>Email</span>,
            }),
            columnUserDataHelper.accessor((row) => row.data_feed_provider, {
                id: "data_feed_provider",
                cell: (item) => item.getValue(),
                header: () => <span>Data Feed Provider</span>,
            }),
            columnUserDataHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
        ];

        this.formRef = React.createRef();

        userDataFilters = [
            {key: 'user_name', placeholder: 'Name'},
            {key: 'email', placeholder: 'Email'},
        ]
    }

    navigate = (name: string) => {
        this.props.onCallback(name);
    }

    componentDidMount() {
        this.getDataFeedProvider()
            .then(() => this.getDates())
            .finally(() => {
                this.setState({isLoading: false})
            })
    }

    componentWillUnmount() {

    }

    getDataFeedProvider = () => {
        return new Promise(resolve => {
            adminService.getDataFeedProviders(this.props.name)
                .then((res: IDataFeedProvider[]) => {
                    const data = res || [];

                    const item = data.find(s => s.name == this.props.name) || null
                    this.setState({data: item})
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    getDates() {
        adminService.getDataFeedProviderDates().then((res: any) => {
            this.dates = res;
        })
            .then(() => {
                const date = this.dates[0] || '';
                this.setState({defaultDate: date, selectedDate: date});
            })
            .finally(() => {
                this.setState({isLoading: false}, async () => {
                    await this.loadData()
                });
            })
    }

    loadData() {
        this.setState({isDataLoading: true})
        const body = {
            name: this.props.name,
            date: this.state.selectedDate
        }
        return new Promise(resolve => {
            adminService.getDataFeedProviderHistory(body).then((res: any) => {
                this.setState({users: res || []})
            }).finally(() => {
                this.setState({isDataLoading: false}, async () => {
                });
            })
        })
    }

    handleSubmit = async (values: any, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({selectedDate: values.date}, () => {
            this.loadData();
        })
    };

    submitForm = () => {
        if (this.formRef.current) {
            this.formRef.current.submitForm();
        }
    }

    downloadDataFeedProviderUsersCSV = () => {
        if (this.tableRef.current) {
            const body = {
                name: this.props.name,
                date: this.state.selectedDate
            }
            adminService.downloadDataFeedProviderHistory(body).then((res) => {
                downloadFile.CSV(`data_feed_providers_${formatterService.formatDateString(this.state.selectedDate)}`, res);
            })
        }
    }

    downloadDataFeedProviderUsersXLSX = () => {
        if (this.tableRef.current) {
            const body = {
                name: this.props.name,
                date: this.state.selectedDate
            }
            adminService.downloadDataFeedProviderHistory(body).then((res) => {
                downloadFile.XLSX(`data_feed_providers_${formatterService.formatDateString(this.state.selectedDate)}`, res);
            })
        }
    }

    openModal = (mode: string, values: IDataFeedProviderUser) => {
        this.props.onCallback(values.email)
    }

    render() {
        return (

            <>
                <div className="user section">
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__top">
                                <div className="content__title">
                                    <img
                                        src={this.state.data?.logo || '/img/no-data.png'}
                                        alt="Logo"
                                        height={70}
                                    />
                                    {this.state.data?.name}
                                </div>
                                <Link href="/backend/data-feed-providers" className="border-btn">Back</Link>
                            </div>
                            <div className={'approve-form mx-0'}>
                                <div className={'approve-form-text d-flex-1'}>
                                    Date: {this.state.selectedDate}
                                </div>
                            </div>


                            <>
                                <div className="content__bottom">


                                    <Formik<any>
                                        innerRef={this.formRef}
                                        initialValues={{date: this.state.selectedDate}}
                                        onSubmit={this.handleSubmit}
                                    >
                                        {({
                                              isSubmitting,
                                              isValid,
                                              dirty,
                                              setFieldValue,
                                              setFieldTouched,
                                              values,
                                              errors
                                          }) => {
                                            return (
                                                <>
                                                    <Form
                                                        className={`content__filter mb-3`}>

                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.state.isDataLoading) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="date"
                                                                id="date"
                                                                as={Select}
                                                                className="select__react"
                                                                classNamePrefix="select__react"
                                                                isClearable={false}
                                                                isSearchable={true}
                                                                placeholder="Date"
                                                                isDisabled={isSubmitting || this.state.isDataLoading}
                                                                onChange={(selectedOption: any) => {
                                                                    setFieldValue('date', selectedOption ? selectedOption.value : '');
                                                                    this.submitForm();
                                                                }}
                                                                options={Object.values(this.dates).map((item) => ({
                                                                    value: item,
                                                                    label: item,
                                                                }))}
                                                                value={
                                                                    Object.values(this.dates).filter((s) => s === this.state.selectedDate).map((item) => ({
                                                                        value: item,
                                                                        label: item,
                                                                    }))
                                                                }
                                                            >
                                                            </Field>
                                                        </div>
                                                        <div
                                                            className="content__title_btns content__filter download-buttons justify-content-end">
                                                            <button className="border-grey-btn ripple d-flex"
                                                                    type={'button'}
                                                                    onClick={this.downloadDataFeedProviderUsersCSV}>
                                                                <span className="file-item__download"></span>
                                                                <span>CSV</span>
                                                            </button>
                                                            <button className="border-grey-btn ripple d-flex"
                                                                    type={'button'}
                                                                    onClick={this.downloadDataFeedProviderUsersXLSX}>
                                                                <span className="file-item__download"></span>
                                                                <span>XLSX</span>
                                                            </button>
                                                        </div>
                                                    </Form>
                                                </>
                                            );
                                        }}
                                    </Formik>
                                </div>

                                <div className="dashboard__transaction__panel">
                                    {this.state.isDataLoading ? (
                                        <LoaderBlock/>
                                    ) : (
                                        <>
                                            {this.state.users.length ? (
                                                <Table
                                                    columns={userDataColumns}
                                                    pageLength={pageLength}
                                                    data={this.state.users}
                                                    searchPanel={true}
                                                    block={this}
                                                    viewBtn={true}
                                                    filters={userDataFilters}
                                                    ref={this.tableRef}
                                                />
                                            ) : (
                                                <div className={'mt-24'}>
                                                    <NoDataBlock primaryText="No data available yet"/>
                                                </div>
                                            )}
                                        </>
                                    )}


                                </div>
                            </>


                        </>
                    )}
                </div>
            </>
        )
    }
}

export default DataFeedProviderBlock;
