export enum FormFieldOptionType {
    TEXT = 'text',
    IMAGE = 'image',
}

export enum FormFieldOptionType2 {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file'
}

export const FormFieldOptionTypeNames = {
    [FormFieldOptionType.TEXT]: 'Free Text Box',
    [FormFieldOptionType.IMAGE]: 'Upload Image',
    [FormFieldOptionType2.FILE]: 'Upload File'
};

export const getFormFieldOptionTypeName = <T extends FormFieldOptionType | FormFieldOptionType2>(type: T): string => {
    return FormFieldOptionTypeNames[type as keyof typeof FormFieldOptionTypeNames] || '';
};
