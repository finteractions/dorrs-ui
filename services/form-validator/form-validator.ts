import * as yup from 'yup';
import YupPassword from 'yup-password';
import * as Yup from "yup";
import {ISchema} from "yup";

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
const phoneNumberField = yup.string()
    .label('Phone Number')
    .required('Required')
    .matches(phoneRegExp, "Incorrect Phone Number")
    .test('is-valid-length', 'Incorrect Phone Number', (value) => {
        const normalizedPhoneNumber = value.replace(/\D/g, '')
        return normalizedPhoneNumber.length >= 10;
    });

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


const FormValidator = {
    firstNameField,
    lastNameField,
    passwordField,
    confirmPasswordField,
    phoneNumberField,
    castFormValues
}

export default FormValidator
