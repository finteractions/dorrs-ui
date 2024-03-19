interface ITableRowProps {
    className?: string;
    attr?: [{}]
    onCallback?: (value: any) => void;
    row?: Array<ITableRow>;
}

interface ITableRow {
    index: number;
    cell: Array<ITableCell>;
}

interface ITableCell {
    index: number,
    style?: {},
    className?: string;
}
