export enum FormFieldOptionType {
    TEXT = 'text',
    IMAGE = 'image'
}

export const FormFieldOptionTypeNames = {
    [FormFieldOptionType.TEXT]: 'Free Text Box',
    [FormFieldOptionType.IMAGE]: 'Upload Image'
};

export const getFormFieldOptionTypeName = <T extends FormFieldOptionType>(type: T): string => {
    return FormFieldOptionTypeNames[type] || '';
};
