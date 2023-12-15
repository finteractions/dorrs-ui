import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import filterService from "@/services/filter/filter";
import {IFees} from "@/interfaces/i-fees";
import formatterService from "@/services/formatter/formatter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faClose, faEdit} from "@fortawesome/free-solid-svg-icons";
import {Field, Form, Formik} from "formik";
import NumericInputField from "@/components/numeric-input-field";
import Modal from "@/components/modal";
import feesService from "@/services/fee/reports-service";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface FeesBlockState extends IModalState {
    loading: boolean;
    data: any[];
    errors: string[];
    modalTitle: string;
    dataFull: any[];
    filterData: any;
    showSymbolForm: boolean;
    cellStates: Map<number, boolean>;
    cellDescriptionStates: Map<number, boolean>;
    description: string;
}

interface FeesBlockProps {
    isAdmin?: boolean;
}

let isAdmin = false;

class FeesBlock extends React.Component<FeesBlockProps, FeesBlockState> {
    state: FeesBlockState;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: FeesBlockProps, context: IDataContext<null>) {
        super(props);

        this.context = context;

        isAdmin = props.isAdmin ?? false;

        this.state = {
            loading: true,
            isOpenModal: false,
            data: [],
            errors: [],
            modalTitle: '',
            dataFull: [],
            filterData: [],
            showSymbolForm: true,
            cellStates: new Map<number, boolean>,
            cellDescriptionStates: new Map<number, boolean>,
            description: ''
        }

        columns = [
            columnHelper.accessor((row) => ({
                service_name: row.service_name,
                description: row.service_description || '',
                next_payment: row.next_payment,
            }), {
                id: "service_name",
                cell: (item) => {
                    return (
                        <span className={(isAdmin || item.getValue().description !== '') ? 'cursor-pointer link' : ''}
                              onClick={() => isAdmin || item.getValue().description !== '' ? this.openModal(item.getValue()) : null}
                        >
                            {item.getValue().service_name}
                        </span>)
                },
                header: () => <span>Source</span>,
            }),
            columnHelper.accessor((row) => ({
                description: row.service_description || '',
                id: row.service_id
            }), {
                id: "description",
                cell: (item) => {
                    let edit = this.state.cellDescriptionStates.get(item.getValue().id) || false;
                    let initialValues: any = {
                        id: item.getValue().id,
                        description: item.getValue().description
                    }

                    return (
                        <>
                            {!edit ? (
                                <div className={`align-items-center d-flex`}>
                                    <div>{item.getValue().description}</div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className='mx-2'
                                            onClick={() => {
                                                this.updateCellDescriptionState(item.getValue().id)
                                            }}>
                                            <FontAwesomeIcon
                                                className="nav-icon"
                                                icon={faEdit}/>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                this.editableDescriptionCell(initialValues, item.getValue())
                            )}
                        </>
                    )
                },
                header: () => <span>Description</span>,
            }),
            columnHelper.accessor((row) => ({
                id: row.nonprofessional_id,
                service_key: row.service_key,
                value: row.nonprofessional_value,
                next_payment: row.nonprofessional_next_payment,
            }), {
                id: "nonprofessional",
                cell: (item) => {
                    let edit = this.state.cellStates.get(item.getValue().id) || false;
                    let initialValues: any = {
                        id: item.getValue().id,
                        price: item.getValue().value
                    }

                    return (
                        <>
                            {!edit ? (
                                <div className={`align-items-center d-flex`}>
                                    <div>{item.getValue().next_payment || formatterService.numberFormat(item.getValue().value || 0)}</div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className='mx-2'
                                            onClick={() => {
                                                this.updateCellState(item.getValue().id)
                                            }}>
                                            <FontAwesomeIcon
                                                className="nav-icon"
                                                icon={faEdit}/>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                this.editableCell(initialValues, item.getValue())
                            )}
                        </>
                    )
                },
                header: () => <span>Nonprofessional</span>,
            }),
            columnHelper.accessor((row) => ({
                id: row.professional_id,
                service_key: row.service_key,
                value: row.professional_value,
                next_payment: row.professional_next_payment,
            }), {
                id: "professional",
                cell: (item) => {
                    let edit = this.state.cellStates.get(item.getValue().id) || false;
                    let initialValues: any = {
                        id: item.getValue().id,
                        price: item.getValue().value
                    }

                    return (
                        <>
                            {!edit ? (
                                <div className={`align-items-center d-flex`}>
                                    <div>{item.getValue().next_payment || formatterService.numberFormat(item.getValue().value || 0)}</div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className='mx-2'
                                            onClick={() => {
                                                this.updateCellState(item.getValue().id)
                                            }}>
                                            <FontAwesomeIcon
                                                className="nav-icon"
                                                icon={faEdit}/>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                this.editableCell(initialValues, item.getValue())
                            )}
                        </>
                    )
                },
                header: () => <span>Professional</span>,
            }),
        ];
    }

    editableDescriptionCell(initialValues: any, cell: any) {
        return (
            <Formik
                initialValues={initialValues}
                onSubmit={this.handleDescriptionSubmit}
            >
                {({
                      isSubmitting,
                  }) => {
                    return (
                        <div style={{maxWidth: '100%'}}>
                            <Form className={`align-items-center d-inline-flex w-100`}>
                                <Field
                                    name="description"
                                    id="description"
                                    as="textarea"
                                    className="w-100"
                                    placeholder="Description"
                                    disabled={isSubmitting}
                                />

                                <div
                                    className='admin-table-actions mx-2'>
                                    <button
                                        type="submit"
                                        className='mx-2'>
                                        <FontAwesomeIcon
                                            className="nav-icon"
                                            icon={faCheck}/>
                                    </button>
                                    <button
                                        type={"button"}
                                        onClick={() => {
                                            this.updateCellDescriptionState(cell.id)
                                        }}
                                        className='mx-2'>
                                        <FontAwesomeIcon
                                            className="nav-icon"
                                            icon={faClose}/>
                                    </button>
                                </div>
                            </Form>
                        </div>

                    );
                }}
            </Formik>
        )
    }

    editableCell(initialValues: any, cell: any) {
        return (
            <Formik
                initialValues={initialValues}
                onSubmit={this.handleSubmit}
            >
                {({
                      isSubmitting,
                  }) => {
                    return (
                        <div style={{maxWidth: '100px'}}>
                            <Form className={`align-items-center d-inline-flex`}>
                                <Field
                                    name='price'
                                    type="number"
                                    component={NumericInputField}
                                    decimalScale={2}
                                    className=""
                                    placeholder={`Value`}
                                    disabled={isSubmitting}
                                />

                                <div
                                    className='admin-table-actions mx-2'>
                                    <button
                                        type="submit"
                                        className='mx-2'>
                                        <FontAwesomeIcon
                                            className="nav-icon"
                                            icon={faCheck}/>
                                    </button>
                                    <button
                                        type={"button"}
                                        onClick={() => {
                                            this.updateCellState(cell.id)
                                        }}
                                        className='mx-2'>
                                        <FontAwesomeIcon
                                            className="nav-icon"
                                            icon={faClose}/>
                                    </button>
                                </div>
                            </Form>
                        </div>

                    );
                }}
            </Formik>
        )
    }

    handleSubmit = async (values: any, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        const body = {
            price: values.price === '' ? '0' : values.price.replace(/,/g, '')
        };

        const id = values.id;

        adminService.setFees(id, body)
            .then(() => {
                setSubmitting(false);
                this.getFees()
            })
    }

    handleDescriptionSubmit = async (values: any, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        const body = {
            description: values.description
        };

        const id = values.id;

        adminService.setServiceDescription(id, body)
            .then(() => {
                setSubmitting(false);
                this.getFees()
            })
    }

    updateCellState(id: number) {
        this.setState((prevState) => {
            const updatedCellStates = new Map(prevState.cellStates);
            updatedCellStates.set(id, !updatedCellStates.get(id));
            return {cellStates: updatedCellStates};
        });
    }

    updateCellDescriptionState(id: number) {
        this.setState((prevState) => {
            const updatedCellStates = new Map(prevState.cellDescriptionStates);
            updatedCellStates.set(id, !updatedCellStates.get(id));
            return {cellDescriptionStates: updatedCellStates};
        });
    }

    componentDidMount() {
        this.getFees();
    }

    getFees = () => {
        this.setState({
            cellStates: new Map<number, boolean>,
            cellDescriptionStates: new Map<number, boolean>
        })

        const request: Promise<Array<IFees>> = isAdmin ? adminService.getFees() : feesService.getFees();

        request.then((res: Array<IFees>) => {
            const data = res || [];
            const tableData: Array<any> = [];

            const serviceNames = Array.from(new Set(data.map(item => `${item.fee_tariff.id}<|>${item.fee_tariff.key}<|>${item.fee_tariff.name}<|>${item.fee_tariff.description}`)))
                .map(key => {
                    const [id, serviceKey, serviceName, description] = key.split('<|>');
                    return {
                        id: id,
                        key: serviceKey,
                        name: serviceName,
                        description: description,
                    };
                });

            serviceNames.forEach(service => {
                const serviceObject = {
                    service_id: service.id,
                    service_name: service.name,
                    service_key: service.key,
                    service_description: service.description,
                    nonprofessional_next_payment: '',
                    professional_next_payment: '',
                    nonprofessional_value: '',
                    professional_value: '',
                    nonprofessional_id: 0,
                    professional_id: 0,
                };

                data.forEach(item => {
                    if (item.fee_tariff.key === service.key) {
                        if (item.fee_price.key === 'nonprofessional') {
                            serviceObject.nonprofessional_value = item.value || '';
                            serviceObject.nonprofessional_id = item.id || 0;
                            serviceObject.nonprofessional_next_payment = item.fee_tariff?.next_payment! || ''
                        } else if (item.fee_price.key === 'professional') {
                            serviceObject.professional_value = item.value || '';
                            serviceObject.professional_id = item.id || 0;
                            serviceObject.professional_next_payment = item.fee_tariff?.next_payment! || ''
                        }
                    }
                });

                tableData.push(serviceObject);
            });

            this.setState({dataFull: tableData, data: tableData}, () => {
                this.filterData();
            });
        })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                setTimeout(() => this.setState({loading: false}), 350)
            });
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getFees();
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

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    openModal(values: { service_name: string, description: string }): void {
        this.setState({isOpenModal: true, modalTitle: values.service_name, description: values.description});
    }

    closeModal(): void {
        this.setState({isOpenModal: false, modalTitle: '', description: ''});
    }

    render() {
        return (

            <>
                <div className="flex-panel-box">
                    <div className={'panel'}>
                        <div className="content__top">
                            <div className="content__title">{isAdmin ? 'Fees Management' : 'Fees'}</div>
                        </div>

                        <div className={'content__bottom'}>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.loading ? (
                                        <LoaderBlock/>
                                    ) : (
                                        <>
                                            {this.state.data.length ? (
                                                <Table
                                                    className={this.context?.userProfile?.customer_type}
                                                    columns={columns}
                                                    data={this.state.data}
                                                    searchPanel={false}
                                                    block={this}
                                                    viewBtn={false}
                                                    editBtn={false}
                                                    deleteBtn={false}
                                                />
                                            ) : (
                                                <>
                                                    {this.state.errors.length ? (
                                                        <AlertBlock type="error" messages={this.state.errors}/>
                                                    ) : (
                                                        <NoDataBlock primaryText="No Fees available yet"/>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                    </div>

                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={this.state.modalTitle}
                >
                    <div>
                        {this.state.description ? this.state.description :
                            <NoDataBlock primaryText={'No description available yet'}/>}
                    </div>
                </Modal>
            </>
        )
    }
}

export default FeesBlock;
