import React from "react";
import {ErrorMessage, Field} from "formik";
import "react-phone-input-2/lib/style.css";
import {getGlobalConfig} from "@/utils/global-config";

const PATH = `${getGlobalConfig().host}`;

class InputWithLocalstorageField extends React.Component<
    {
        field: any,
        id: string,
        type: string,
        placeholder: string,
        form: any,
        disabled: boolean,
        className?: string,
        keyName?: string;
    }
> {
    async componentDidMount() {
        const {field, form, keyName} = this.props;
        const fieldName = field.name;
        const fieldValue = field.value;
        const fieldKey = keyName ?? fieldName;
        const localstorageKey = `${PATH}-${fieldKey}`;
        const storedValue = localStorage.getItem(localstorageKey);

        if (fieldValue === "" && storedValue !== null) {
            await form.setFieldValue(fieldName, storedValue);
            await form.setFieldTouched(fieldName, true);
        }
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {field, form, keyName} = this.props;
        const fieldName = field.name;
        const value = event.target.value;
        const fieldKey = keyName ?? fieldName;
        const localstorageKey = `${PATH}-${fieldKey}`;
        form.setFieldValue(fieldName, value);
        localStorage.setItem(localstorageKey, value);
    };

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
                    disabled={disabled}
                    value={fieldValue}
                    onChange={this.handleChange}
                />
                <ErrorMessage name={fieldName} component="div" className="error-message"/>
            </>
        );
    }
}

export default InputWithLocalstorageField;
