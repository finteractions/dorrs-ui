import React from "react";
import {ErrorMessage, Field} from "formik";
import OtpInput from "react-otp-input";

const NUM_INPUTS = 6

class OtpCodeInputField extends React.Component<{ field: any; form: any }> {
    inputRefs: Array<React.RefObject<HTMLInputElement>>;

    constructor(props: { field: any; form: any }) {
        super(props);

        this.inputRefs = Array.from({length: NUM_INPUTS}, () => React.createRef());
    }

    componentDidMount() {
        if (this.inputRefs[0].current) {
            this.inputRefs[0].current?.focus();
        }
    }

    handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const {form} = this.props;
        const currentIndex = this.inputRefs.findIndex(
            (ref) => ref.current === document.activeElement
        );

        if (event.key === "ArrowLeft") {
            if (currentIndex > 0) {
                this.inputRefs[currentIndex - 1].current?.focus();
            }
        } else if (event.key === "ArrowRight") {
            if (currentIndex < this.inputRefs.length - 1) {
                this.inputRefs[currentIndex + 1].current?.focus();
            }
        } else if (event.key === "Backspace") {
            if (currentIndex > 0) {
                setTimeout(() => this.inputRefs[currentIndex - 1].current?.focus(),0)
            }
        } else if (event.key === "Enter") {
            if (form.submitForm) {
                form.submitForm();
            }
        }
    };

    handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const {form, field} = this.props;
        const pastedValue = event.clipboardData.getData("text/plain");
        const sanitizedValue = pastedValue.replace(/\D/g, "");
        form.setFieldValue(field.name, sanitizedValue, true);
        event.preventDefault();
        this.inputRefs[this.inputRefs.length - 1].current?.focus();
    };

    handleChange = (value: string) => {
        const {form, field} = this.props;
        form.setFieldValue(field.name, value, true);
        const currentIndex = this.inputRefs.findIndex(
            (ref) => ref.current === document.activeElement
        );

        if (currentIndex < this.inputRefs.length - 1 && value.length !== this.inputRefs.length && value != '') {
            this.inputRefs[currentIndex + 1].current?.focus();
        }
    };

    render() {
        const field = this.props.field;

        return (
            <>
                <Field name={field.name}>
                    {({field}: { field: any }) => (
                        <div>
                            <OtpInput
                                {...field}
                                numInputs={NUM_INPUTS}
                                inputType={"tel"}
                                inputStyle={{width: "100%"}}
                                shouldAutoFocus={true}
                                onChange={this.handleChange} // Используем обновленный обработчик onChange
                                renderInput={(props, index) => {
                                    return (
                                        <div className="input">
                                            <div className="input__wrap">
                                                <input
                                                    {...props}
                                                    ref={this.inputRefs[index]}
                                                    className="input__text input-code"
                                                    onKeyDown={this.handleKeyDown}
                                                    onPaste={this.handlePaste}
                                                />
                                            </div>

                                        </div>
                                    );
                                }}
                            />
                            <ErrorMessage
                                name={field.name}
                                component="div"
                                className="error-message"
                            />
                        </div>
                    )}
                </Field>
            </>
        );
    }
}

export default OtpCodeInputField;
