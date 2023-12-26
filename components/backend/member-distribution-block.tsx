import React, {RefObject} from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {IChartStatistics} from "@/interfaces/i-chart-statistics";
import {IMemberDistributionPerTariff} from "@/interfaces/i-member-distribution-per-tariff";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import Modal from "@/components/modal";
import {getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Field, Form, Formik, FormikProps} from "formik";
import * as Yup from "yup";
import {IMemberDistribution} from "@/interfaces/i-member-distribution";
import MemberDistributionInfoBlock from "@/components/backend/member-distribution-info-block";


interface MemberDistributionBlockState {
    isOpenModal: boolean;
    isLoading: boolean;
    isDataLoading: boolean;
    memberDistributionStatisticsData: any[];
    data: IMemberDistribution[];
    dataFull: IMemberDistribution[];
    filterData: any;
    formData: IMemberDistribution | null;
    errors: string[];
    formAction: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

const formSchema = Yup.object().shape({
    date: Yup.string(),
})

const initialValues = {
    date: '',
}

class MemberDistributionBlock extends React.Component<{}> {
    state: MemberDistributionBlockState;
    formRef: RefObject<FormikProps<any>>;
    dates: Array<string>;

    constructor(props: {}) {
        super(props);

        this.state = {
            isOpenModal: false,
            isLoading: true,
            isDataLoading: false,
            memberDistributionStatisticsData: [],
            data: [],
            dataFull: [],
            filterData: [],
            errors: [],
            formData: null,
            formAction: 'view'
        }

        columns = [
            columnHelper.accessor((row) => row.firm_name, {
                id: "firm_name",
                cell: (item) => item.getValue(),
                header: () => <span>Firm</span>,
            }),
            columnHelper.accessor((row) => row.due_amount, {
                id: "due_amount",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Due Amount</span>,
            }),
            columnHelper.accessor((row) => ({
                status: row.status,
                statusName: row.status_name
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().statusName}
                        </div>
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        this.formRef = React.createRef();
        this.dates = [];
    }

    componentDidMount() {
        this.getDates()
    }

    getDates() {
        adminService.getMemberDistributionDates().then((res: any) => {
            this.dates = res;
        })
            .then(() => {
                initialValues.date = this.dates[0] || ''
            })
            .finally(() => {
                this.setState({isLoading: false}, () => {
                    this.submitForm();
                });
            })
    }


    getStatistics(values: any) {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributionStatistics(values)
                .then((res: Array<IChartStatistics>) => {
                    this.setState({memberDistributionStatisticsData: res})

                })
                .finally(() => {
                    resolve(true)
                })
        })
    }

    getMemberDistribution(values: any) {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributions(values)
                .then((res: IMemberDistribution[]) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                    });
                    this.setState({dataFull: data, data: data}, () => {
                        this.filterData();
                    });
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    handleSubmit = async (values: any, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true);
        this.setState({
            isDataLoading: true
        });

        await this.loadData(values)
            .finally(() => setSubmitting(false));
    };

    loadData(values: any) {
        return new Promise(resolve => {
            this.getStatistics(values)
                .then(() => this.getMemberDistribution(values))
                .finally(() => {
                    this.setState({isLoading: false, isDataLoading: false})
                    resolve(true);
                })
        })

    }

    submitForm = async () => {
        if (this.formRef.current) {
            await this.formRef.current.submitForm();
        }
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    closeModal(): void {
        this.setState({isOpenPerTariffModal: false, isOpenModal: false, formData: null});
    }

    getClassName(name: string) {
        const statuses: any = {
            'total_forecast': 'bg-light-blue',
            'total_approved': 'bg-light-green',
            'total_payment_due': 'bg-light-yellow',
            'total_commission': 'bg-light-red',
        }

        return statuses[name.toLowerCase()] || '#000'
    }

    getStatisticsTitle(name: string) {
        const titles: any = {
            'total_forecast': 'Total Forecast',
            'total_approved': 'Total Approved',
            'total_payment_due': 'Total Payment Due',
            'total_commission': 'DORRS Commission',

        }

        return titles[name.toLowerCase()] || ''
    }

    openModal = (mode: string, data?: IMemberDistributionPerTariff) => {
        this.setState({formAction: mode, formData: data || null, isOpenModal: true})
    }

    onCallback = async (values: any, step: boolean) => {
        if (this.formRef.current) {
            const values = this.formRef.current.values;
            await this.loadData(values);
        }
    };

    render() {
        return (

            <>
                <div className="dashboard section">
                    <div className="content__top">
                        <div className="content__title">Member Distribution</div>
                    </div>

                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__filter mb-3">
                                <Formik<any>
                                    innerRef={this.formRef}
                                    initialValues={initialValues}
                                    validationSchema={formSchema}
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
                                                <Form className={'content__filter mb-3'}>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.state.isDataLoading) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="weekly_date"
                                                            id="weekly_date"
                                                            as={Select}
                                                            className="select__react"
                                                            classNamePrefix="select__react"
                                                            isClearable={false}
                                                            isSearchable={true}
                                                            placeholder="Date"
                                                            isDisabled={isSubmitting || this.state.isDataLoading}

                                                            options={this.dates.map((item) => ({
                                                                value: item,
                                                                label: item,
                                                            }))}
                                                            onChange={(selectedOption: any) => {
                                                                setFieldValue('date', selectedOption.value);
                                                                this.submitForm();
                                                            }}
                                                            value={
                                                                this.dates.filter(i => i === values.date).map((item) => ({
                                                                    value: item,
                                                                    label: item,
                                                                }))?.[0] || null
                                                            }
                                                        >
                                                        </Field>
                                                    </div>

                                                    <button type="submit"
                                                            className={`content__filter-clear ripple ${(isSubmitting || this.state.isDataLoading) ? 'disable' : ''}`}
                                                            disabled={isSubmitting || this.state.isDataLoading || values.date === '' || values.report === ''}>
                                                        <FontAwesomeIcon className="nav-icon"
                                                                         icon={filterService.getFilterResetIcon()}/>
                                                    </button>
                                                </Form>
                                            </>
                                        );
                                    }}
                                </Formik>
                            </div>


                            {this.state.isDataLoading ? (
                                <LoaderBlock/>
                            ) : (
                                <>

                                    <div className="view_panel statistics__panel flex-1 mx-0 mb-4">
                                        {this.state.memberDistributionStatisticsData.map(item => {
                                            return (
                                                <div key={item.key}
                                                     className={` statistics flex-25 dashboard__chart ${this.getClassName(item.key)}`}>
                                                    <div className='bold'>{this.getStatisticsTitle(item.key)}</div>
                                                    <div>${formatterService.numberFormat(item.value, 2)}</div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="dashboard__transaction__panel">
                                        {this.state.data.length ? (
                                            <Table
                                                columns={columns}
                                                data={this.state.data}
                                                searchPanel={false}
                                                block={this}
                                                viewBtn={true}
                                                filter={false}
                                            />
                                        ) : (
                                            <div className={'mt-24'}>
                                                <NoDataBlock primaryText="No data available yet"/>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {this.state.errors.length > 0 && (
                                <AlertBlock type="error" messages={this.state.errors}/>
                            )}
                        </>
                    )}
                </div>


                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={'View Member Distribution'}
                       className={'big_modal'}
                >

                    <MemberDistributionInfoBlock data={this.state.formData} onCallback={this.onCallback}/>
                </Modal>

            </>
        )
    }
}

export default MemberDistributionBlock;
