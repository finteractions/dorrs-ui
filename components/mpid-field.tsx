import React from "react";
import {Field} from "formik";
import "react-phone-input-2/lib/style.css";

import formService from "@/services/form/form-service";

interface InputMPIDFieldState extends IState {
    selectedMPID: IMPIDSearch | null
    availableMPID: IMPIDSearch[] | [],
    availableMPIDLoading: boolean
}

interface InputMPIDFieldProps {
    field: any,
    id: string,
    type: string,
    placeholder: string,
    form: any,
    disabled: boolean,
    className?: string,
    keyName?: string;
}

class InputMPIDField extends React.Component<InputMPIDFieldProps, InputMPIDFieldState> {

    state: InputMPIDFieldState;

    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: InputMPIDFieldProps) {
        super(props);

        this.state = {
            success: false,
            availableMPID: [],
            selectedMPID: null,
            availableMPIDLoading: false,
        }
    }

    handleSelected = (item: IMPIDSearch) => {
        this.setState({availableMPID: [], selectedMPID: item}, async () => {
            await this.props.form.setFieldValue(this.props.field.name, item.name);
        });
    }

    handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const {field, form, keyName} = this.props;
        const fieldName = field.name;
        const value = event.target.value.trim().toUpperCase();

        this.setState({availableMPID: []}, async () => {
            await form.setFieldValue(fieldName, value);
            await form.setFieldTouched(field.name, true);

            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            this.debounceTimer = setTimeout(() => {
                this.fetchMPID();
            }, 500);
        })

    }

    handleBlur = async () => {
        const {field, form, keyName} = this.props;
        await form.setFieldTouched(field.name, true);
        await this.fetchMPID()
    }

    fetchMPID = async () => {
        const {field, form, keyName} = this.props;
        const value = field.value;

        // await form.setSubmitting(true);

        this.setState({availableMPIDLoading: true}, async () => {
            await formService.searchMPID(value)
                .then(async (res: Array<IMPIDSearch>) => {
                    const data = res || []
                    this.setState({availableMPID: data});
                    if (data.length === 0) {
                        await form.setFieldError(field.name, "No MPID found");
                    }
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages});
                })
                .finally(() => {
                    this.setState({availableMPIDLoading: false}, () => {
                        // form.setSubmitting(false);
                    });
                });
        });

    }

    render() {
        const {field, id, type, placeholder, disabled, className} = this.props;
        const fieldName = field.name;
        const fieldValue = field.value;
        const fieldClassNAme = className ?? 'input__text';

        return (
            <>
                <Field
                    name={fieldName}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={fieldClassNAme}
                    disabled={disabled || this.state.availableMPIDLoading}
                    value={fieldValue}
                    onChange={this.handleChange}
                    // onBlur={this.handleBlur}
                />

                <div className="input__wrap__search_company">
                    {this.state.availableMPID.map((item: ICompanySearch) => (
                        <button
                            disabled={this.state.availableMPIDLoading || disabled}
                            className="b-btn ripple search_company_item"
                            onClick={() => this.handleSelected(item)}
                            key={item.id}>{item.name}</button>
                    ))}
                </div>

                {this.props.form.errors[field.name] && this.props.form.touched[field.name] && (
                    <div className="error-message">{this.props.form.errors[field.name]}</div>
                )}
            </>
        );
    }
}

export default InputMPIDField;
