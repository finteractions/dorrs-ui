import React from 'react';
import NoDataBlock from "@/components/no-data-block";
import {Field, Form, Formik} from "formik";
import adminService from "@/services/admin/admin-service";


interface BankFormProps extends ICallback {
    action: string;
    data: { columnDefinition: any, columnValues: any } | null;
    onCancel?: () => void;
}

class BankForm extends React.Component<BankFormProps> {
    columnDefinition: any;
    columnValues: any;

    constructor(props: BankFormProps) {
        super(props);

        this.state = {
            success: false,
        };

        this.columnDefinition = this.props.data?.columnDefinition || {};
        this.columnValues = this.props.data?.columnValues || {};
    }

    handleSubmit = async (values: Record<string, string | boolean | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true)
        adminService.updateBank(this.columnValues)
            .then(() => {
                this.props.onCallback(null);
            })
    };


    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
                return (
                    <Formik
                        initialValues={{}}
                        validationSchema={null}
                        onSubmit={this.handleSubmit}
                    >
                        {({
                              isSubmitting,
                              setFieldValue,
                          }) => {
                            return (
                                <Form className={`modal__content`} >
                                    {Object.keys(this.columnDefinition).map((columnName) => (
                                        <div key={columnName}>
                                            {typeof this.columnValues[columnName] === "object" ? (
                                                <>
                                                    <h5 className={'mb-24'}>{this.columnDefinition[columnName].title}</h5>
                                                    {Object.keys(this.columnDefinition[columnName].properties).map((nestedPropertyName) => (

                                                        <div key={nestedPropertyName}
                                                             className="input">
                                                            <div
                                                                className="input__title">{this.columnDefinition[columnName].properties[nestedPropertyName]}</div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                                                <Field
                                                                    name={`${columnName}.${nestedPropertyName}`}
                                                                    id={`${columnName}.${nestedPropertyName}`}
                                                                    type="text"
                                                                    className="input__text input-class-3"
                                                                    value={this.columnValues[columnName][nestedPropertyName]}
                                                                    disabled={isSubmitting}
                                                                    onChange={(event: any) => {
                                                                        const value = event.target?.value || '';
                                                                        setFieldValue(event.target.name, value);
                                                                        this.columnValues[columnName][nestedPropertyName] = value;
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="input">
                                                        <div
                                                            className="input__title">{this.columnDefinition[columnName].title}</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                                            <Field
                                                                name={`${columnName}`}
                                                                id={`${columnName}`}
                                                                type="text"
                                                                className="input__text input-class-3"
                                                                value={this.columnValues[columnName]}
                                                                disabled={isSubmitting}
                                                                onChange={(event: any) => {
                                                                    const value = event.target?.value || '';
                                                                    setFieldValue(event.target.name, value);
                                                                    this.columnValues[columnName] = value;
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <button className={`b-btn ripple `}
                                            type="submit"
                                            id="add-bank-acc"
                                            disabled={isSubmitting}
                                    >
                                        Submit
                                    </button>
                                </Form>
                            );
                        }}
                    </Formik>
                )
            default    :
                return (
                    <NoDataBlock secondaryText={'No Form for this action'}/>
                );
        }

    }
}

export default BankForm;
