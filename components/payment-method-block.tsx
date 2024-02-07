import React from 'react';
import PaymentMethodStripeCreditDebitCardBlock from "@/components/payment-method-stripe-credit-debit-card-block";
import PaymentMethodStripeACHBlock from "@/components/payment-method-stripe-ach-block";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import {ErrorMessage, Field, Form, Formik} from "formik";
import bankService from "@/services/bank/bbo-service";
import {IBank} from "@/interfaces/i-bank";
import * as Yup from "yup";

interface PaymentMethodBlockState extends IState {
    isForm: boolean;
    isEdit: boolean;
    isCreditDebitCardForm: boolean;
    isACHForm: boolean;
    isProcessing: boolean;
    activeForm: string;

    isDashboard: boolean;
    amountStored: number | undefined;
    amount: number | undefined;
    isLoading: boolean;
    reInit: boolean;

    errorMessages: string[];
    formsLoadedCount: number;
    bank: {
        columnDefinition: any,
        columnValues: any
    },
    formConfirmInitialValues: {
        isConfirmed: boolean
    },
}

const formSchemaConfirm = Yup.object().shape({
    isConfirmed: Yup.boolean().label('Confirm'),
});

interface PaymentMethodBlockProps extends ICallback {
    isDashboard?: boolean;
    amount?: number;
    errorMessages?: Array<string> | null;
}

class PaymentMethodBlock extends React.Component<PaymentMethodBlockProps, PaymentMethodBlockState> {

    state: PaymentMethodBlockState;
    creditDebitCardBlockRef: React.RefObject<PaymentMethodStripeCreditDebitCardBlock> = React.createRef();
    achBlockRef: React.RefObject<PaymentMethodStripeACHBlock> = React.createRef();

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: PaymentMethodBlockProps, context: IDataContext<null>) {
        super(props);

        this.context = context;

        this.state = {
            isDashboard: this.props?.isDashboard ?? false,
            amountStored: this.props?.amount,
            amount: this.props?.amount,
            isForm: false,
            isEdit: false,
            isCreditDebitCardForm: false,
            isACHForm: false,
            errorMessages: [],
            success: false,
            isProcessing: false,
            activeForm: 'wire',
            isLoading: this.props?.isDashboard ?? false,
            reInit: false,
            formsLoadedCount: 0,
            bank: {
                columnDefinition: {},
                columnValues: {}
            },
            formConfirmInitialValues: {
                isConfirmed: false
            },
        }
    }

    onCallback = async (values: any, setFormSubmit: (value: boolean) => void) => {

        if (values === null) {
            this.closeForm()
        } else {

            if (values?.processing === true || values?.processing === false) {
                this.setState({isProcessing: values?.processing}, () => {
                    if (values?.processing === false) this.processing();
                })
            }

            if (values?.type === 'card') {
                this.setState({isForm: false, isCreditDebitCardForm: true})
            }

            if (values?.type === 'us_bank_account') {
                this.setState({isForm: false, isACHForm: true})
            }


            if (values?.payment) {
                this.setState({isProcessing: true}, () => {
                    this.props.onCallback(values, setFormSubmit)
                })
            }

            if (values?.defaultType) {
                this.setState({activeForm: values.defaultType, isLoading: false})
            } else {
                this.setState({formsLoadedCount: this.state.formsLoadedCount + 1}, () => {
                    if (this.state.formsLoadedCount >= 2) this.setState({isLoading: false})
                })
            }

        }
    }

    processing = () => {
        const cardPromise = this.creditDebitCardBlockRef.current?.getCard();
        const achPromise = this.achBlockRef.current?.getACH();


        this.setState({isProcessing: false}, async () => {
            await Promise.all([cardPromise, achPromise])
                .finally(() => {
                    this.setState({isProcessing: false, reInit: false})
                })
        })
    }

    openForm = () => {
        this.setState({
            isForm: true,
            isEdit: true,
            activeForm: 'us_bank_account',
            isCreditDebitCardForm: false,
            isACHForm: false,
            amount: undefined
        })
    }

    closeForm = () => {
        this.setState({
            isForm: false,
            isEdit: false,
            isCreditDebitCardForm: false,
            isACHForm: false,
            activeForm: 'wire',
            amount: this.state.amountStored,
            reInit: this.state.isDashboard,
        }, () => {
            if (this.state.isDashboard) {
                this.setState({isLoading: true}, () => {
                    this.processing();
                })
            }
        })
    }

    setActiveForm = (form: string) => {
        this.setState({activeForm: form})
    }

    async componentDidMount() {

        if (this.state.isDashboard) {
            await this.getBank()
        }
    }

    componentDidUpdate(prevProps: PaymentMethodBlockProps) {
        if (this.props?.errorMessages !== prevProps?.errorMessages) {
            this.setState({errorMessages: this.props?.errorMessages ?? []}, () => {
                this.setState({isProcessing: !(this.state.errorMessages.length > 0)})
            })
        }

    }

    getBank = () => {
        return new Promise(resolve => {
            bankService.getBank()
                .then((res: Array<IBank>) => {
                    const bank = res[0];
                    const columns = bank.columns;
                    let values = bank.values;

                    const columnsObject = JSON.parse(columns)
                    values = values.replace(/'/g, '"');
                    const valuesObject = JSON.parse(values)

                    this.setState({
                        bank: {
                            columnDefinition: columnsObject,
                            columnValues: valuesObject
                        }
                    })
                })
                .finally(() => resolve(true));
        })
    }

    handleConfirm = async (values: Record<string, boolean>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.props.onCallback(null)
    }

    paymentInfo = () => {
        this.props.onCallback(null)
    }

    render() {

        const count = Object.keys(this.state.bank.columnDefinition).reduce((count, columnName) => {
            const values = this.state.bank.columnValues[columnName];
            if (typeof values === "object") {
                const nonEmptyValues = Object.values(values)
                    .filter(value => value !== null && value !== undefined && value !== '');
                return count + (nonEmptyValues.length);
            } else if (values !== null && values !== undefined && values !== '') {
                return count + 1;
            }

            return count;
        }, 0);

        const shouldRenderCreditDebitCardBlock = this.state.isACHForm || (this.state.isDashboard && !this.state.isCreditDebitCardForm && !this.state.isACHForm && this.state.activeForm === 'wire') || !['wire', 'card'].includes(this.state.activeForm);
        const shouldRenderACHBlock = this.state.isCreditDebitCardForm || (this.state.isDashboard && !this.state.isCreditDebitCardForm && !this.state.isACHForm && this.state.activeForm === 'wire') || !['wire', 'us_bank_account'].includes(this.state.activeForm);

        return (
            <>
                {this.state.isLoading && (
                    <LoaderBlock/>
                )}

                {!this.state.reInit && (
                    <div className={this.state.isLoading ? 'd-none' : ''}>
                        <div
                            className={`profile__right-title justify-content-between align-items-center d-flex ${this.state.isDashboard ? 'mb-2' : ''}`}>

                            <div>{!this.state.isDashboard ? 'My ' : ''}Payment method</div>

                            <div
                                className={`content__title_btns content__filter download-buttons justify-content-end`}>

                                {this.state.isForm || this.state.isCreditDebitCardForm || this.state.isACHForm ? (
                                    <button
                                        className={`b-btn ripple width-unset ${this.state.isProcessing ? 'disable' : ''}`}
                                        onClick={this.closeForm}
                                        disabled={this.state.isProcessing}
                                    >
                                        Back
                                    </button>
                                ) : (

                                    <button
                                        className={`b-btn ripple width-unset ${this.state.isProcessing ? 'disable' : ''}`}
                                        onClick={this.openForm}
                                        disabled={this.state.isProcessing}
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={''}>
                            <ul className={`nav nav-tabs ${this.state.isForm || this.state.amount ? '' : 'd-none'}`}
                                id="tabs">
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeForm === 'us_bank_account' ? 'active' : ''}`}
                                       id="home-tab"
                                       data-bs-toggle="tab"
                                       href="#form"
                                       onClick={() => this.setActiveForm('us_bank_account')}
                                    >
                                        Bank Account (ACH)
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeForm === 'card' ? 'active' : ''}`}
                                       id="profile-tab"
                                       data-bs-toggle="tab"
                                       href="#form"
                                       onClick={() => this.setActiveForm('card')}>
                                        Credit or Debit Card
                                    </a>
                                </li>

                                {this.state.isDashboard && !this.state.isEdit && (
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeForm === 'wire' ? 'active' : ''}`}
                                           id="home-tab"
                                           data-bs-toggle="tab"
                                           href="#form"
                                           onClick={() => this.setActiveForm('wire')}
                                        >
                                            WIRE
                                        </a>
                                    </li>
                                )}

                            </ul>

                            <div className="tab-content">
                                <div
                                    className={`tab-pane show fade mt-24 active`}
                                    id="form">
                                    <div
                                        className={this.state.isForm || this.state.amount ? 'payment-method-form' : ''}>
                                        <div
                                            className={shouldRenderCreditDebitCardBlock ? 'd-none' : ''}>
                                            <PaymentMethodStripeCreditDebitCardBlock
                                                ref={this.creditDebitCardBlockRef}
                                                onCallback={this.onCallback}
                                                isForm={this.state.isForm || this.state.isCreditDebitCardForm}
                                                isEdit={this.state.isEdit}
                                                isProcessing={this.state.isProcessing}
                                                isDashboard={this.state.isDashboard}
                                                amount={this.state.amount}
                                                errorMessages={this.state.errorMessages}
                                            />

                                        </div>

                                        <div
                                            className={shouldRenderACHBlock ? 'd-none' : ''}>
                                            <PaymentMethodStripeACHBlock
                                                ref={this.achBlockRef}
                                                onCallback={this.onCallback}
                                                isForm={this.state.isForm || this.state.isACHForm}
                                                isEdit={this.state.isEdit}
                                                isProcessing={this.state.isProcessing}
                                                isDashboard={this.state.isDashboard}
                                                amount={this.state.amount}
                                                errorMessages={this.state.errorMessages}
                                            />
                                        </div>


                                        {this.state.isDashboard && this.state.activeForm === 'wire' && !this.state.isEdit && (
                                            <div
                                                className={this.state.activeForm === 'wire' ? '' : 'd-none'}>
                                                <div className={'view_panel flex-1 mx-0 mt-2'}>
                                                    <>

                                                        {count >= 3 ? (
                                                            <>
                                                                {Object.keys(this.state.bank.columnDefinition).map((columnName) => {
                                                                    const values = this.state.bank.columnValues[columnName];

                                                                    if (typeof values === "object") {
                                                                        const nonEmptyValues = Object.values(values)
                                                                            .filter(value => value !== null && value !== undefined && value !== '');


                                                                        return (
                                                                            <div className={'view_block'}
                                                                                 key={columnName}>
                                                                                <div
                                                                                    className={'view_block_title bold'}>
                                                                                    {this.state.bank.columnDefinition[columnName].title}
                                                                                </div>
                                                                                <div className={''}>
                                                                                    {nonEmptyValues.join(', ') || '-'}
                                                                                </div>
                                                                            </div>
                                                                        );

                                                                    } else if (values !== null && values !== undefined && values !== '') {
                                                                        return (
                                                                            <div className={'view_block'}
                                                                                 key={columnName}>
                                                                                <div
                                                                                    className={'view_block_title bold'}>
                                                                                    {this.state.bank.columnDefinition[columnName].title}
                                                                                </div>
                                                                                <div className={''}>
                                                                                    {values || '-'}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return null;
                                                                })}</>
                                                        ) : (
                                                            <NoDataBlock
                                                                primaryText={' '}
                                                                secondaryText={'The payment information is not available now. Please contact the administrator.'}
                                                            />
                                                        )}
                                                        <div className={'view_block'}>
                                                            <div className={'view_block_title bold'}>
                                                                Decsription
                                                            </div>
                                                            <div className={''}>
                                                                Ref#: {this.context.userProfile.reference_number}
                                                            </div>
                                                        </div>
                                                    </>
                                                    <div className={'w-100 my-0 '}>Be sure you set
                                                        Your Ref# {`"${this.context.userProfile.reference_number}"`} to
                                                        payment
                                                        description. We will be
                                                        able to figure out whose the payment if there is no the number
                                                    </div>
                                                    <div className={'w-100 my-0 '}>
                                                        <Formik
                                                            initialValues={this.state.formConfirmInitialValues}
                                                            validationSchema={formSchemaConfirm}
                                                            onSubmit={this.handleConfirm}
                                                        >
                                                            {({
                                                                  isSubmitting,
                                                                  setFieldValue,

                                                              }) => {
                                                                return (
                                                                    <Form className={``}>
                                                                        <div className="input">
                                                                            <div
                                                                                className={`b-checkbox${isSubmitting ? ' disable' : ''}`}>
                                                                                <Field
                                                                                    type="checkbox"
                                                                                    name="isConfirmed"
                                                                                    id="isConfirmed"
                                                                                    disabled={isSubmitting}
                                                                                    onClick={(e: any) => {
                                                                                        const confirm = e.target.value === 'false';
                                                                                        setFieldValue("isConfirmed", confirm);

                                                                                        if (confirm) this.paymentInfo();
                                                                                    }}
                                                                                />
                                                                                <label htmlFor="isConfirmed">
                                                            <span>

                                                            </span>
                                                                                    <i className={'label-normal'}> Confirm,
                                                                                        you
                                                                                        set Ref#
                                                                                        to the description </i>
                                                                                </label>
                                                                                <ErrorMessage name="isConfirmed"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    </Form>
                                                                );
                                                            }}
                                                        </Formik>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}


            </>

        )
    }
}

export default PaymentMethodBlock
