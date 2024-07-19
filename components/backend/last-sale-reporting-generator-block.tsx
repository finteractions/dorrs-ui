import React, {RefObject} from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {ISymbol} from "@/interfaces/i-symbol";
import * as Yup from "yup";
import {ErrorMessage, Field, Form, Formik} from "formik";
import Table from "@/components/table/table";
import Select from "react-select";
import {createColumnHelper} from "@tanstack/react-table";
import Modal from "@/components/modal";

interface LastSaleGeneratorState {
    isLoading: boolean;
    symbols: ISymbol[];
    isOrderGeneratorEnable: boolean,
    lastSaleGeneratorSymbols: Array<string>,
    errors: string[];
    formInitialValues: {},
    isOpenModal: boolean,
    isDeleting: boolean,
    isClearing: boolean,
    formData: string | null
}

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required').label('Symbol'),
    is_enable: Yup.boolean().label('Enable'),
});

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class LastSaleGeneratorBlock extends React.Component<{}> {
    state: LastSaleGeneratorState;
    formRef: RefObject<any>;

    constructor(props: {}) {
        super(props);

        const initialValues: ILastSaleGenerator = {
            symbol: '',
            is_enable: false,
            symbol_tmp: ''
        }

        this.state = {
            isLoading: true,
            symbols: [],
            errors: [],
            formInitialValues: initialValues,
            isOrderGeneratorEnable: false,
            lastSaleGeneratorSymbols: [],
            isOpenModal: false,
            isDeleting: false,
            isClearing: false,
            formData: null
        }

        columns = [
            columnHelper.accessor((row) => row, {
                id: "symbol",
                cell: (item) => item.getValue(),
                header: () => <span>View</span>,
            }),
        ];

        this.formRef = React.createRef();
    }

    async componentDidMount() {
        await this.load()
    }

    async load() {
        await this.getLastSaleGeneratorStatus()
            .then(() => this.getLastSaleGeneratorSymbols())
            .then(() => this.getSymbols())
            .finally(async () => {
                if (this.formRef.current) {
                    await this.formRef.current.resetForm();
                    this.setState({isLoading: false});

                    setTimeout(async () => {
                        await this.formRef.current.setFieldValue('is_enable', this.state.isOrderGeneratorEnable)
                            .then(async () => await this.formRef.current.setFieldTouched('is_enable', false, true))
                    })

                }

                this.setState({isLoading: false})
            })
    }

    getLastSaleGeneratorSymbols = () => {
        return new Promise(resolve => {
            adminService.getLastSaleGeneratorSymbols()
                .then((res: Array<string>) => {
                    res.sort();
                    this.setState({lastSaleGeneratorSymbols: res})
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    getLastSaleGeneratorStatus = () => {
        return new Promise(resolve => {
            adminService.getLastSaleGeneratorStatus()
                .then((res: Array<{ status: boolean }>) => {

                    const status = res[0].status;
                    if (this.state.isOrderGeneratorEnable !== status) {
                        this.setState({isOrderGeneratorEnable: status})
                    }
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    getSymbols = () => {
        return new Promise(resolve => {
            adminService.getAssets()
                .then((res: ISymbol[]) => {
                    let data = res || [];
                    data = data.filter(s => !s.symbol_id)
                    data = data.filter(s => s.is_approved).filter(s => !this.state.lastSaleGeneratorSymbols.includes(s.symbol))

                    this.setState({symbols: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    handleSubmit = async (values: ILastSaleGenerator, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true)
        const body = {
            symbol: values.symbol
        }
        await adminService.addLastSaleGeneratorSymbol(body)
            .then((res: Array<string>) => {

            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(async () => {
                setSubmitting(false)
                await this.load()
            });
    }

    handleStatusChangeSubmit = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        const isEnable = e.target.value === 'false';
        setFieldValue("is_enable", isEnable);
        setSubmitting(true);

        const body = {
            is_enable: isEnable
        }
        await adminService.setLastSaleGeneratorStatus(body)
            .then(((res: any) => {

            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.load()
            });
    }

    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    onCancel = async () => {
        this.closeModal();
        await this.load()
    };

    handleDelete = async (symbol: string | null) => {
        this.setState({isDeleting: true});

        await adminService.deleteLastSaleGeneratorSymbol(symbol ?? '')
            .then(((res: any) => {

            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
                this.closeModal();
                this.load();
            });
    }

    openModal = (mode: string, data?: string) => {

        this.setState({
            isOpenModal: true,
            formData: data || null
        })
    }

    clear = async () => {
        this.setState({isClearing: true})
        await adminService.deleteLastSaleGeneratorLastSales()
            .then(((res: any) => {

            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isClearing: false})
            });
    }

    render() {
        return (

            <>
                <div className="user section">
                    <div className={'approve-form'}>
                        <div className={'approve-form-text'}>
                            Last Sale Generator
                        </div>
                    </div>

                    {this.state.isLoading && (
                        <LoaderBlock/>
                    )}
                    <div className={`w-100 ${this.state.isLoading ? 'd-none' : ''}`}>
                        <div className={'form-panel'}>
                            <div>
                                <Formik<ILastSaleGenerator>
                                    initialValues={this.state.formInitialValues as ILastSaleGenerator}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                >
                                    {({
                                          isSubmitting,
                                          setSubmitting,
                                          setFieldValue,
                                          isValid,
                                          dirty,
                                          values,
                                          resetForm,
                                          errors
                                      }) => {
                                        return (
                                            <Form style={{maxWidth: '350px'}}>

                                                <div className="input">
                                                    <div
                                                        className={`b-checkbox b-checkbox${isSubmitting ? ' disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="is_enable"
                                                            id="is_enable_last_sale_generator"
                                                            disabled={isSubmitting}
                                                            onClick={(e: React.ChangeEvent<HTMLInputElement>) => this.handleStatusChangeSubmit(e, setFieldValue, {setSubmitting})}
                                                        />
                                                        <label htmlFor="is_enable_last_sale_generator">
                                                            <span></span><i> Enable
                                                        </i>
                                                        </label>
                                                        <ErrorMessage name="is_enable" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Clear all generated Last Sales</div>
                                                    <div
                                                        className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                        <div>
                                                            <button
                                                                className={`b-btn ripple ${(isSubmitting || this.state.isClearing) ? 'disable' : ''}`}
                                                                disabled={isSubmitting || this.state.isClearing}
                                                                onClick={this.clear}
                                                            >Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Symbol <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                        <Field
                                                            name="symbol"
                                                            id="symbol"
                                                            as={Select}
                                                            className="b-select-search"
                                                            placeholder="Select Symbol"
                                                            classNamePrefix="select__react"
                                                            isDisabled={isSubmitting}
                                                            options={Object.values(this.state.symbols).map((item) => ({
                                                                value: item.symbol,
                                                                label: `${item.company_profile?.company_name || ''} ${item.symbol}`,
                                                            }))}
                                                            value={values.symbol ? {
                                                                value: values.symbol,
                                                                label: values.symbol
                                                            } : null}
                                                            onChange={(selectedOption: any) => {
                                                                setFieldValue('symbol', selectedOption.value);
                                                            }}
                                                        />

                                                        <Field type="hidden" name="symbol" id="symbol"/>
                                                        <ErrorMessage name="symbol" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <button id="add-bank-acc"
                                                        className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                    Add
                                                </button>


                                                {this.state.errors && (
                                                    <AlertBlock type={"error"} messages={this.state.errors}/>
                                                )}
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </div>
                            <div>
                                <div className="content__top">
                                    <div className="content__title">Symbols</div>

                                </div>

                                {this.state.lastSaleGeneratorSymbols.length ? (
                                    <Table columns={columns}
                                           pageLength={pageLength}
                                           data={this.state.lastSaleGeneratorSymbols}
                                           searchPanel={true}
                                           block={this}
                                           viewBtn={false}
                                           editBtn={false}
                                           deleteBtn={true}
                                    />
                                ) : (
                                    <>
                                        {this.state.errors.length ? (
                                            <AlertBlock type="error" messages={this.state.errors}/>
                                        ) : (
                                            <NoDataBlock primaryText="No data available yet"/>
                                        )}
                                    </>
                                )}

                            </div>
                        </div>



                    </div>

                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={'Do you want to remove this Symbol?'}
                >

                    <div className="confirm-btns-panel">

                        <button className="border-btn ripple"
                                onClick={() => this.onCancel()}>Cancel
                        </button>

                        <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                type="button" disabled={this.state.isDeleting}
                                onClick={() => this.handleDelete(this.state.formData)}>Confirm
                        </button>
                    </div>
                </Modal>
            </>
        )
    }
}

export default LastSaleGeneratorBlock;
