export enum YesNoType {
    YES = 'Yes',
    NO = 'No'
}

export const YesNoTypeNames = {
    [YesNoType.YES]: 'Yes',
    [YesNoType.NO]: 'No',
};

export const getYesNoTypeName = <T extends YesNoType>(type: T): string => {
    return YesNoTypeNames[type] || '';
};
