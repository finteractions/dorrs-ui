import React from "react";
import {Field} from "formik";
import PhoneInput from "react-phone-input-2";
import {isValidPhoneNumber} from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

class PhoneInputField extends React.Component<{ field: any, form: any, disabled: boolean, height?: number }> {

    handleInput = async (value: any, form: any, field: any) => {
        if (value && !value.startsWith("+")) {
            value = "+" + value;
        }
        const isValid = isValidPhoneNumber(value)
        await form.setFieldValue(field.name, value);
        if (!isValid) await form.setFieldError(field.name, form.errors[field.name] ?? "Invalid Phone Number");
    }

    handleBlur = async (event: React.FocusEvent<HTMLInputElement>, form: any, field: any) => {
        await form.setFieldTouched(field.name, true);
        await this.handleInput(field.value, form, field);
    }

    render() {
        const field = this.props.field;
        const form = this.props.form;
        const disabled = this.props.disabled || false;
        const height = this.props.height || 35;

        const customStyles = {
            width: '100%',
            height: `${height}px`,
            borderRadius: '6px',
            border: '1px solid #718494',
            boxSizing: 'border-box',
            padding: '0 16px',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '16px',
            color: '#1e2c3c',
            paddingLeft: '55px',
        };

        return (
            <>
                <Field name={field.name}>
                    {({field}: { field: any }) => (
                        <div>
                            <PhoneInput
                                {...field}
                                country="us"
                                disabled={disabled}
                                containerClass={`phone-input-container`}
                                inputClass={`input__text ${disabled ? 'disable' : ''}`}
                                inputProps={{name: field.name, style: customStyles}}
                                onChange={async (value) => {
                                    await this.handleInput(value, form, field)
                                }}
                                onBlur={async (event) => {
                                    await this.handleBlur(event, form, field)
                                }}
                            />

                            {form.errors[field.name] && form.touched[field.name] && (
                                <div className="error-message">{form.errors[field.name]}</div>
                            )}
                        </div>
                    )}
                </Field>
            </>
        );
    }
}

export default PhoneInputField;
