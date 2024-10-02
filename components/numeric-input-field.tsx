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
    disabled?: boolean,
    isThousandSeparator?: boolean
    maxLength?: number
}

class NumericInputField extends React.Component<NumericInputFieldProps> {

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {field, form, handleChange} = this.props;
        const {name} = field;

        if (event.target) {
            const inputValue = event.target.value;

            if (inputValue !== "" && parseFloat(inputValue) < 0) {
                form.setFieldValue(name, "");
            } else {
                if (handleChange) handleChange(event);
                form.setFieldValue(name, inputValue);
            }
        }
    };

    render() {
        const {
            field,
            form,
            placeholder,
            className,
            decimalScale,
            disabled,
            handleChange,
            isThousandSeparator,
            maxLength
        } = this.props;
        const {name} = field;
        field.value = field.value !== '' ? formatterService.numberDown(field.value, decimalScale || 0) : field.value;
        const isSeparator = isThousandSeparator ?? true;

        return (
           <>
               <NumericFormat
                   name={name}
                   allowLeadingZeros
                   thousandSeparator={isSeparator ? ',' : ''}
                   className={className}
                   placeholder={placeholder}
                   decimalScale={decimalScale}
                   disabled={disabled}
                   maxLength={maxLength}
                   onChange={this.handleChange}
                   onBlur={field.onBlur}
                   value={field.value}
               />

               <ErrorMessage name={name} component="div" className="error-message"/>
           </>
    )
        ;
    }
}

export default NumericInputField;
