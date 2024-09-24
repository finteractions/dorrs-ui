interface ITableFilter {
    key: string;
    placeholder: string;
    type?: 'datePickerRange' | 'multiSelect' | 'customSelect';
    condition?: ITableFilterCondition
}

interface ITableFilterCondition {
    values: {[key: string]: any};
    isClearable: boolean;
    isSearchable: boolean;
    selected: string;
    condition: { [key: string]: any };
}
