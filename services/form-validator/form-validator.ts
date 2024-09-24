import * as yup from 'yup';
import YupPassword from 'yup-password';
import * as Yup from "yup";
import {ISchema} from "yup";
import {FormikErrors} from "formik";

YupPassword(yup) // extend yup

const firstNameField = yup.string()
    .label('First Name')
    .required('Required')
    .min(2).max(99)

const lastNameField = yup.string()
    .label('Last Name')
    .required('Required')
    .min(2).max(99)

const passwordField = yup.string()
    .label('Password')
    .required('Required')
    .min(8).max(50)
    .minLowercase(1).minUppercase(1).minNumbers(1)//.minSymbols(1);

const confirmPasswordField = (name: string) => yup.string()
    .when(name, (password, field): any => {
        if (password) {
            return field
                .required('Required')
                .oneOf([yup.ref(name)], "Passwords must match")
        }
    })

const phoneRegExp = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{2,6}$/im;
const phoneNumberField = (required = true) => {
    let schema = yup.string()
        .label('Phone Number')
        .matches(phoneRegExp, "Incorrect Phone Number")
        .test('is-valid-length', 'Incorrect Phone Number', (value) => {
            if (!value) return true; // Разрешаем пустое значение, если оно не является обязательным
            const normalizedPhoneNumber = value.replace(/\D/g, '');
            return normalizedPhoneNumber.length >= 10;
        });

    if (required) {
        schema = schema.required('Required');
    }

    return schema;
};

const castFormValues = (values: any, schema: Yup.ObjectSchema<any>) => {
    Object.keys(schema.fields).forEach((s: string) => {
        const field = schema.fields[s];
        if (typeof field === 'object' && 'type' in field) {
            switch (field.type) {
                case 'number':
                    values[s] = Number(values[s].toString().replace(/,/g, ''));
                    break;
                default:
                    break;
            }
        }
    });

    return values;
};

const requiredFields = (schema: Yup.ObjectSchema<any>, values: any, errors: FormikErrors<any>) => {
    setTimeout(() => {
        document.querySelectorAll('.required')
            .forEach(s => s.classList.remove('required'))

        const requiredFieldsAll: string[] = [];

        Object.keys(schema.fields).forEach(key => {
            let hasRequired = !(schema.fields[key] as any).spec.optional; // && !values[key]
            if (hasRequired) {
                if (Array.isArray(values[key])) {
                    hasRequired = (values[key] as Array<any>).length === 0
                } else {
                    hasRequired = !values[key]
                }
            }

            if (hasRequired) requiredFieldsAll.push(key)
        })
        const requiredFieldsToFill = Object.keys(errors)
        const requiredFields = requiredFieldsToFill.length === 0 ? requiredFieldsAll : requiredFieldsToFill

        requiredFields.forEach(field => {
            const el = document.body.querySelector<any>(`[name="${field}"]`);
            const el_tmp = document.querySelector<any>(`[name="${field}_tmp"]`);

            if (el && !el.disabled) {
                const tagName = el.tagName.toLowerCase();

                switch (tagName) {
                    case 'select':
                        if (el.classList.contains('b-select')) el.classList.add('required')
                        break;
                    default:
                        if (el.classList.contains('DateInput_input')) {
                            const parent = el.closest('.SingleDatePickerInput');
                            if (parent) {
                                parent.classList.add('required');
                            }
                        } else {

                            if (el.type == 'hidden') {
                                const parent = el.closest('.b-select-search')
                                if (parent) {
                                    const el = parent.querySelector('.select__react__control');
                                    if (el) el.classList.add('required');
                                }
                            } else {
                                el.classList.add('required');

                                const nextElement = el.nextElementSibling;
                                if (nextElement?.classList.contains('flag-dropdown')) {
                                    nextElement.classList.add('required');
                                }
                            }
                        }
                }
            }

            if (el && el_tmp && !values[field]) {
                const previousEl = el_tmp.previousElementSibling
                if (previousEl && previousEl.classList.contains('select__react__control')) previousEl.classList.add('required')
            }
        })
    },)
}


const FormValidator = {
    firstNameField,
    lastNameField,
    passwordField,
    confirmPasswordField,
    phoneNumberField,
    castFormValues,
    requiredFields
}

export default FormValidator
