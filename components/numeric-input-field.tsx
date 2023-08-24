import React from "react";
import {ErrorMessage} from "formik";
import {NumericFormat} from "react-number-format";
import formatterService from "@/services/formatter/formatter-service";

interface NumericInputFieldProps {
    field: any,
    form: any,
    placeholder: string,
    className: string,
    decimalScale?: number
    handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    disabled?: boolean
}

class NumericInputField extends React.Component<NumericInputFieldProps> {
    render() {
        const {field, form, placeholder, className, decimalScale, disabled, handleChange} = this.props;
        const {name} = field;

        field.value = field.value !== '' ? formatterService.numberDown(field.value, decimalScale || 0) : field.value;

        return (
            <div>
                <NumericFormat
                    name={name}
                    allowLeadingZeros
                    thousandSeparator=","
                    className={className}
                    placeholder={placeholder}
                    decimalScale={decimalScale}
                    disabled={disabled}
                    onChange={(event) => {
                        if (handleChange) handleChange(event);
                        form.setFieldValue(name, event.target.value);
                    }}
                    onBlur={field.onBlur}
                    value={field.value}
                />

                <ErrorMessage name={name} component="div" className="error-message"/>
            </div>
        );
    }
}

export default NumericInputField;
