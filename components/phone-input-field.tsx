import React, { useState, useEffect } from "react";
import { Field } from "formik";
import PhoneInput from "react-phone-input-2";
import { isValidPhoneNumber, getCountryCallingCode, CountryCode } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

const PhoneInputField: React.FC<{ field: any; form: any; disabled: boolean; height?: number }> = ({ field, form, disabled, height = 35 }) => {
    const [localValue, setLocalValue] = useState(field.value || "");
    const defaultCountry: CountryCode = "US";
    const defaultCountryCode = `+${getCountryCallingCode(defaultCountry)}`;

    const customStyles = {
        width: "100%",
        height: `${height}px`,
        borderRadius: "6px",
        border: "1px solid #718494",
        boxSizing: "border-box",
        padding: "0 16px",
        fontWeight: "400",
        fontSize: "14px",
        lineHeight: "16px",
        color: "#1e2c3c",
        paddingLeft: "55px",
    };

    useEffect(() => {
        if (field.value !== localValue) {
            setLocalValue(field.value || "");
        }
    }, [field.value]);

    const handleInput = async (value: string) => {
        if (value === undefined) return;

        if (value && !value.startsWith("+")) {
            value = "+" + value;
        }

        setLocalValue(value);

        if (value.length > defaultCountryCode.length) {
            const isValid = isValidPhoneNumber(value);
            if (!isValid) {
                await form.setFieldError(field.name, "Invalid Phone Number");
            } else {
                await form.setFieldError(field.name, undefined);
            }
        } else {
            await form.setFieldError(field.name, undefined);
        }

        await form.setFieldValue(field.name, value || "");
    };

    const handleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
        await form.setFieldTouched(field.name, true);
        const isValid = isValidPhoneNumber(localValue);
        if (!isValid && localValue.length > defaultCountryCode.length) {
            await form.setFieldError(field.name, "Invalid Phone Number");
        }
    };

    const handleEmptyInput = async () => {
        setLocalValue(defaultCountryCode);

        await form.setFieldValue(field.name, "");
        await form.setFieldError(field.name, undefined);
        await form.setFieldTouched(field.name, false);
    };

    return (
        <Field name={field.name}>
            {() => (
                <div>
                    <PhoneInput
                        value={localValue || ""}
                        country={defaultCountry.toLowerCase()}
                        disabled={disabled}
                        placeholder={defaultCountryCode}
                        containerClass={`phone-input-container`}
                        inputClass={`input__text ${disabled ? "disable" : ""}`}
                        inputProps={{ name: field.name, style: customStyles }}
                        onChange={async (value) => {
                            if (!value) {
                                await handleEmptyInput();
                            } else {
                                await handleInput(value);
                            }
                        }}
                        onBlur={async (event) => {
                            if (!localValue) {
                                await handleEmptyInput();
                            }
                            await handleBlur(event);
                        }}
                    />
                    {form.errors[field.name] && form.touched[field.name] && (
                        <div className="error-message">{form.errors[field.name]}</div>
                    )}
                </div>
            )}
        </Field>
    );
};

export default PhoneInputField;
