import React from "react";
import {ErrorMessage, Field} from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

class PhoneInputField extends React.Component<{ field: any, form: any, disabled: boolean }> {


    render() {
        const field = this.props.field;
        const disabled = this.props.disabled || false;

        const customStyles = {
            width: '100%',
            height: '35px',
            borderRadius:'4px',
            border: '1px solid #c5cacf',
            boxSizing: 'border-box',
            padding: '0 16px',
            fontFamily: 'Avenir',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '16px',
            color: '#1e2c3c',
            paddingLeft: '55px',
        };

        return (
            <>
                <Field name={field.name}>
                    {({field, form}: { field: any; form: any }) => (

                        <div>
                            <PhoneInput
                                {...field}
                                country="us"
                                disabled={disabled}
                                containerClass={`phone-input-container`}
                                inputClass={`input__text ${disabled? 'disable' : ''}`}
                                inputProps={{name: field.name, style: customStyles}}
                                onChange={(value) => {
                                    if (value && !value.startsWith("+")) {
                                        value = "+" + value;
                                    }
                                    form.setFieldValue(field.name, value);
                                }}
                            />
                            <ErrorMessage name={field.name} component="div"
                                          className="error-message"/>
                        </div>
                    )}
                </Field>
            </>

        );
    }
}

export default PhoneInputField;
