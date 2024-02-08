import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import {ErrorMessage, Field, Form, Formik} from "formik";
import bankService from "@/services/bank/bbo-service";
import {IBank} from "@/interfaces/i-bank";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";

interface PaymentMethodWireBlockState extends IState {
    isLoading: boolean;
    bank: {
        columnDefinition: any,
        columnValues: any
    },
    formConfirmInitialValues: {
        isConfirmed: boolean
    },
}

const formSchemaConfirm = Yup.object().shape({
    isConfirmed: Yup.boolean().oneOf([true], "Required")
});

interface PaymentMethodWireBlockProps extends ICallback {
    isDashboard?: boolean;
    amount?: number;
    errorMessages?: Array<string> | null;
}

class PaymentMethodWireBlock extends React.Component<PaymentMethodWireBlockProps, PaymentMethodWireBlockState> {

    state: PaymentMethodWireBlockState;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: PaymentMethodWireBlockProps, context: IDataContext<null>) {
        super(props);

        this.context = context;

        this.state = {
            isLoading: true,
            errorMessages: [],
            success: false,
            bank: {
                columnDefinition: {},
                columnValues: {}
            },
            formConfirmInitialValues: {
                isConfirmed: false
            },
        }
    }

    async componentDidMount() {
        await this.getBank()
    }

    componentDidUpdate(prevProps: PaymentMethodWireBlockProps) {
        if (this.props?.errorMessages !== prevProps?.errorMessages) {
            this.setState({errorMessages: this.props?.errorMessages ?? []})
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
                .finally(() => {
                    this.setState({isLoading: false}, () => {
                        resolve(true)
                    })

                });
        })
    }

    handleConfirm = (values: Record<string, boolean>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true)

        this.props.onCallback({payment: true, amount: this.props.amount, pm_id: 'wire'}, setSubmitting)
    }

    cancel = () => {
        this.props.onCallback({back: true})
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


        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (<>
                        <div className={'w-100 mt-3 mb-2'}>Make a wire to the next Bank Information:
                        </div>
                        <div className={'tile indicators content__bottom mt-3 mb-4 justify-content-center'}>
                            <div className={'view_panel mx-0 p-20'}>
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
                            </div>
                        </div>

                        <div className={'w-100 mt-3 mb-3 '}>Be sure you set
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
                                      isValid,
                                      dirty,
                                  }) => {
                                    return (
                                        <Form className={`payment-form`}>
                                            <div className={'profile__right-wrap-full'}>
                                                <div className="input">
                                                    <div
                                                        className={`b-checkbox${isSubmitting ? ' disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="isConfirmed"
                                                            id="isConfirmed"
                                                            disabled={isSubmitting}
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


                                                <div className={'profile__panel'}>
                                                    <div className={'profile__info__panel'}>
                                                        <div className={'input__box buttons'}>
                                                            <button
                                                                className={`mt-4 b-btn ripple flex-0 my-0 ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                                type="submit"
                                                                disabled={isSubmitting || !isValid || !dirty}
                                                            >
                                                                I have done the payment
                                                            </button>


                                                            <button
                                                                className={`mt-4 b-btn-border ripple my-0 ${isSubmitting ? 'disable' : ''}`}
                                                                type="button"
                                                                disabled={isSubmitting}
                                                                onClick={this.cancel}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.state.errorMessages && this.state.errorMessages.length > 0 && (
                                                    <AlertBlock type={'error'} messages={this.state.errorMessages}/>
                                                )}
                                            </div>
                                        </Form>
                                    );
                                }}
                            </Formik>
                        </div>
                    </>
                )}
            </>

        )
    }
}

export default PaymentMethodWireBlock
