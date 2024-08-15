import {
    SortingState,
    useReactTable,
    getCoreRowModel,
    flexRender,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import React, {ForwardedRef, forwardRef} from "react";
import Pagination from "@/components/table/pagination";
import NoDataBlock from "@/components/no-data-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faEye, faTrashCan, faClose} from "@fortawesome/free-solid-svg-icons";
import {FormStatus} from "@/enums/form-status";
import {OrderStatus} from "@/enums/order-status";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";
import Select from "react-select";
import filterService from "@/services/filter/filter";
import DateRangePicker from "@/components/date-range-picker";
import moment from 'moment';

interface ITableProps {
    columns: any[];
    columns_for_search?: any[];
    data: any;
    block?: any;
    pageLength?: number;
    rowProps?: ITableRowProps;
    searchPanel?: boolean
    editBtn?: boolean
    viewBtn?: boolean
    deleteBtn?: boolean,
    customBtnProps?: Array<ICustomButtonProps>,
    filter?: boolean
    access?: any,
    className?: string,
    filters?: ITableFilter[];
    filtersClassName?: string;
    options?: { type: string },
    header?: boolean
}

interface TableRef {
    getColumnFilters?: () => { [key: string]: string };
}

const filterData = (data: any[], searchValue: string, columnFilters: { [key: string]: string | Array<string> }) => {
    searchValue = searchValue?.trim();
    const originalColumns = new Set<string>();

    Object.keys(columnFilters).forEach((key: string) => {
        if (columnFilters[key] === "") {
            delete columnFilters[key];
        } else {
            const [rowKey, nestedKey] = key.split('.');
            originalColumns.add(rowKey);
        }
    });

    const getAllValues = (obj: any) => {
        const values: any[] = [];

        const extractValues = (o: any) => {
            Object.keys(o).forEach(key => {
                if (typeof o[key] === 'object' && o[key] !== null) {
                    extractValues(o[key]);
                } else {
                    values.push(o[key]);
                }
            });
        };

        extractValues(obj);
        return values;
    };

    if (searchValue.length > 0 || Object.keys(columnFilters).length > 0) {
        data = data.filter((rowData) => {
            const columnKeys = Object.keys(columnFilters);

            if (columnKeys.length > 0) {
                return columnKeys.every((columnKey) => {
                    const [rowKey, nestedKey] = columnKey.split('.');
                    const value = typeof rowData[rowKey] === "object" ? rowData[rowKey]?.[nestedKey] ?? undefined : rowData[columnKey];

                    const valueString = (typeof value === 'undefined' || value === null ? '' : value).toString();

                    if (Array.isArray(rowData[rowKey])) {
                        switch (typeof columnFilters[rowKey]) {
                            case "string":
                                return (rowData[rowKey] as Array<string>).includes(columnFilters[rowKey] as string)
                            case "object":
                                const values = (columnFilters[rowKey] as Array<string>).map((s: any) => s.value)
                                if (values.length > 0) {
                                    return values.some(filterValue => {
                                        return (rowData[rowKey] as Array<string>).includes(filterValue)
                                    });
                                } else {
                                    return data
                                }
                        }
                    } else if (Array.isArray(rowData[rowKey]) && typeof columnFilters[rowKey] === 'string') {
                        return (rowData[rowKey] as Array<string>).includes(columnFilters[rowKey] as string)
                    } else if (typeof rowData[rowKey] === 'string' && Array.isArray(columnFilters[rowKey])) {
                        const values = (columnFilters[rowKey] as Array<string>).map((s: any) => s.value)
                        if (values.length > 0) {
                            return values.some(filterValue => {
                                return rowData[rowKey] as string === filterValue
                            });
                        } else {
                            return data
                        }
                    }

                    const startDate = (columnFilters[columnKey] as any).startDate;
                    const endDate = (columnFilters[columnKey] as any).endDate;

                    if (startDate && endDate) {
                        const date = moment(rowData[rowKey]);
                        return !((startDate && date.isBefore(startDate, 'date')) || (endDate && date.isAfter(endDate, 'date')));
                    }

                    return valueString === columnFilters[columnKey] && (searchValue === "" || valueString.toLowerCase().includes(searchValue.toLowerCase()));
                });
            } else {
                const allValues = getAllValues(rowData).map(value => (value === null ? "" : value.toString().toLowerCase()));
                return searchValue === "" || allValues.some((val: string) => val.includes(searchValue.toLowerCase()));
            }
        });
        return data;
    } else {
        return data;
    }
};


const Table = forwardRef<TableRef, ITableProps>(({
                                                     columns,
                                                     columns_for_search,
                                                     data,
                                                     pageLength,
                                                     rowProps,
                                                     searchPanel,
                                                     block,
                                                     editBtn,
                                                     viewBtn,
                                                     deleteBtn,
                                                     customBtnProps,
                                                     filter,
                                                     access,
                                                     className,
                                                     filters,
                                                     filtersClassName,
                                                     options,
                                                     header = true
                                                 }: ITableProps,
                                                 ref: ForwardedRef<TableRef>) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [searchValue, setSearchValue] = React.useState("");
    const [originalData, setOriginalData] = React.useState(data);
    const [filteredData, setFilteredData] = React.useState(originalData);
    const [columnFilters, setColumnFilters] = React.useState<{ [key: string]: string }>({});
    const [selectedDateRange, setSelectedDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
    const [datePickers, setDatePickers] = React.useState<{ [key: string]: any | null }>({});
    const dateRangePickerRef = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
        getColumnFilters: () => columnFilters,
    }));


    const table = useReactTable({
        columns: columns,
        data: filteredData,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {sorting},
        onSortingChange: setSorting,
    });
    const headers = table.getFlatHeaders();
    const rows = table.getRowModel().rows;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.trim();
        setSearchValue(searchValue);
        setFilteredData(filterData(originalData, searchValue, columnFilters));
    };


    const resetFilters = () => {
        setColumnFilters({});
        setSearchValue('');
        setSelectedDateRange([null, null]);
        setFilteredData(filterData(originalData, searchValue, columnFilters));

        dateRangePickerRef.current?.onReset();
    };

    const renderFilter = (column: any) => {
        const {id} = column;
        const selectOptionsSet = new Set();

        originalData.forEach((data: any) => {
            const keys = Object.keys(data);
            keys.forEach((key: string) => {
                const value =
                    typeof data[key] === "object" ? data[key]?.[id] ?? undefined : data[id];
                if (value !== undefined && value !== null) {
                    selectOptionsSet.add(value);
                }
            });
        });

        const selectOptions = Array.from(selectOptionsSet);
        const value = columnFilters[id] ?? '';

        return (
            <>
                {selectOptions.length > 0 && (
                    <select
                        className='select-filter'
                        value={value}
                        onChange={(e) => handleFilterChange(id, e.target.value)}
                    >
                        <option value="">All</option>
                        {selectOptions.map((option: any) => (
                            <option key={option} value={option.toString()}>
                                {normalizeOption(option.toString())}
                            </option>
                        ))}
                    </select>
                )}

            </>
        );
    };
    const renderFilterSelect = (filterKey: string, placeholder: string, type?: string) => {
        const isMulti = type && type === "multiSelect";

        const selectOptionsSet = new Set();
        originalData.forEach((dataItem: any) => {
            const value = dataItem[filterKey];
            if (value !== undefined && value !== null && value !== '') {
                selectOptionsSet.add(value);
            }
        });

        const selectOptions = filterService.buildOptions(filterKey, originalData)
        const value = columnFilters[filterKey] ?? '';

        return (
            <>
                {!isMulti ? (
                    <Select
                        key={filterKey}
                        className="select__react"
                        classNamePrefix="select__react"
                        isClearable={true}
                        isSearchable={true}
                        value={value ? {value, label: value} : null}
                        onChange={(selectedOption) => handleFilterChange(filterKey, selectedOption?.value ?? '')}
                        placeholder={placeholder}
                        options={selectOptions}
                    />
                ) : (
                    <Select
                        key={filterKey}
                        className="select__react"
                        classNamePrefix="select__react"
                        isClearable={true}
                        isSearchable={true}
                        isMulti={true}
                        value={value ? value : []}
                        onChange={(selectedOption) => handleFilterChange(filterKey, selectedOption ?? [])}
                        placeholder={placeholder}
                        options={selectOptions as any}
                    />
                )}
            </>
        );
    };

    const renderFilterDateRange = (filterKey: string, placeholder: string) => {
        return (
            <DateRangePicker
                key={filterKey}
                ref={dateRangePickerRef}
                onChange={(startDate, endDate) => {
                    if (startDate && endDate) {
                        setSelectedDateRange([startDate, endDate]);
                        handleFilterChange(filterKey, {startDate, endDate});
                    }

                }}
                onReset={() => {

                }}
            />
        );
    };

    const normalizeOption = (value: string) => {
        switch (value) {
            case 'true':
                return 'Yes'
                break;
            case 'false':
                return 'No'
                break
            default:
                return value;
        }
    }

    const handleFilterChange = (columnId: string, value: any) => {
        setColumnFilters((prevFilters) => ({
            ...prevFilters,
            [columnId]: value,
        }));

        setFilteredData(filterData(originalData, searchValue, columnFilters));
    };

    const isEditButtonDisabled = (row: any) => {
        const editable = row.editable ?? true
        return !editable;
    };

    const isButtonDisabled = (row: any) => {
        return row && [FormStatus.DELETED, OrderStatus.CLOSED].includes(row['status']?.toLowerCase());
    };

    const isButtonDeleteDisabled = (row: any) => {
        return row && [FormStatus.DELETED].includes(row['status']?.toLowerCase());
    };

    const dataLabel = (cell: any) => {
        const header = (cell.column?.columnDef?.header as any);

        const children = header?.().props?.children;

        let result: string | undefined;

        if (typeof children === 'string') {
            result = children;
        } else if (Array.isArray(children)) {
            const filteredStrings = children.filter((child: any) => typeof child === 'string' && child.trim() !== '');
            result = filteredStrings.join('/');
        }

        return result;
    }

    const [currentPage, setCurrentPage] = React.useState(0);

    React.useEffect(() => {
        const currentPageIndex = table.getState().pagination.pageIndex;
        setCurrentPage(currentPageIndex);
        setOriginalData(data);
        setFilteredData(filterData(data, searchValue, columnFilters));
    }, [data, table, searchValue, columns_for_search, columnFilters]);


    return (

        <>
            {!data.length ? (
                    <NoDataBlock/>
                ) :
                (
                    <>


                        {(filters || searchPanel) && (
                            <div className={`content__filter table-content-filter mb-3 ${filtersClassName}`}>
                                {searchPanel && (
                                    <input
                                        type="text"
                                        className='search-filter'
                                        value={searchValue}
                                        onChange={handleSearchChange}
                                        placeholder="Search"
                                    />
                                )}
                                {filters && (
                                    <>
                                        {filters?.map((filter, index) => (
                                            <div key={filter.key} className="input__wrap">
                                                {filter?.type === 'datePickerRange' ? (
                                                    <>
                                                        {renderFilterDateRange(filter.key, filter.placeholder)}
                                                    </>


                                                ) : (
                                                    <>
                                                        {renderFilterSelect(filter.key, filter.placeholder, filter.type)}
                                                    </>
                                                )}
                                                {index === filters.length - 1 && (

                                                    <button className="content__filter-clear ripple"
                                                            onClick={resetFilters}>
                                                        <FontAwesomeIcon className="nav-icon"
                                                                         icon={filterService.getFilterResetIcon()}/>
                                                    </button>

                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}

                            </div>
                        )}

                        <div className="table">
                            <div className='overflow-x-auto'>
                                <table className={className}>
                                    {header && (
                                        <thead>
                                        <tr>
                                            {headers.map((header) => {
                                                const direction = header.column.getIsSorted() as string;

                                                return (
                                                    <th key={header.id}>
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                className={`sort-th-box cursor-pointer position-relative`}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                <span className={`sort-ico ${direction}`}></span>
                                                            </div>
                                                        )}

                                                    </th>
                                                );
                                            })}
                                            {(editBtn && (!access || access.edit)) || (deleteBtn && (!access || access.delete)) || viewBtn || customBtnProps || filter ? (
                                                <th>

                                                </th>
                                            ) : ''}
                                        </tr>
                                        {filter && (
                                            <tr>
                                                {headers.map((header) => {
                                                    return (
                                                        <th key={header.id}>
                                                            {filter && (
                                                                <>
                                                                    {renderFilter(header.column)}
                                                                </>
                                                            )}
                                                        </th>
                                                    );
                                                })}

                                                <th className={filter ? 'reset-filter' : ''}>
                                                    {filter && (
                                                        <div className='admin-table-actions'>
                                                            <button
                                                                onClick={resetFilters}
                                                                className='btn-reset-filter'><FontAwesomeIcon
                                                                className="nav-icon" icon={faClose}/></button>
                                                        </div>

                                                    )}
                                                </th>

                                            </tr>
                                        )}
                                        </thead>
                                    )}
                                    <tbody>
                                    {rows.map((row, idx) => (
                                        <tr id={row.id}
                                            key={row.id} {...rowProps?.attr?.reduce((acc, attr) => ({...acc, ...attr}), {})}
                                            className={rowProps?.className}
                                            onClick={() => {
                                                rowProps?.onCallback?.(row.original);
                                            }}
                                        >
                                            {row.getVisibleCells().map((cell, index, array) => {
                                                const cellStyle = rowProps?.row?.[row?.id as any]?.cell?.[index]?.style || {};
                                                const cellClassName = rowProps?.row?.[row?.id as any]?.cell?.[index]?.className || '';

                                                return (
                                                    <td data-label={dataLabel(cell)}
                                                        colSpan={index === array.length - 1 && !editBtn && !deleteBtn && !viewBtn && !customBtnProps ? 2 : 1}
                                                        key={cell.id}
                                                        style={cellStyle ? {...cellStyle} : {}}
                                                        className={cellClassName ? cellClassName : ''}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                )
                                            })}
                                            {(editBtn && (!access || access.edit)) || (deleteBtn && (!access || access.delete)) || viewBtn || customBtnProps ? (
                                                <td>
                                                    <div className='admin-table-actions'>
                                                        {viewBtn && (
                                                            <button
                                                                onClick={() => block.openModal('view', row.original, options?.type)}
                                                                className='admin-table-btn ripple'><FontAwesomeIcon
                                                                className="nav-icon" icon={faEye}/></button>
                                                        )}
                                                        {editBtn && (!access || access.edit) && (
                                                            <button
                                                                disabled={isEditButtonDisabled(row.original) || isButtonDisabled(row.original)}
                                                                onClick={() => block.openModal('edit', row.original, options?.type)}
                                                                className={`admin-table-btn ripple ${isEditButtonDisabled(row.original) || isButtonDisabled(row.original) ? 'disable' : ''}`}>
                                                                <FontAwesomeIcon
                                                                    className="nav-icon" icon={faEdit}/></button>
                                                        )}
                                                        {customBtnProps && (
                                                            customBtnProps.map((buttonProps, index) => (
                                                                <div key={index}>
                                                                    <button
                                                                        disabled={isButtonDisabled(row.original)}
                                                                        onClick={() => block[buttonProps.onCallback](row.original)}
                                                                        className={`custom-btn admin-table-btn ripple ${isButtonDisabled(row.original) ? 'disable' : ''}`}
                                                                    >
                                                                        {buttonProps.icon as any}
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                        {deleteBtn && (!access || access.delete) && (
                                                            <button
                                                                disabled={isButtonDeleteDisabled(row.original)}
                                                                onClick={() => block.openModal('delete', row.original, options?.type)}
                                                                className={`admin-table-btn ripple ${isButtonDeleteDisabled(row.original) ? 'disable' : ''}`}>
                                                                <FontAwesomeIcon
                                                                    className="nav-icon" icon={faTrashCan}/></button>
                                                        )}
                                                    </div>
                                                </td>
                                            ) : ''}
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr className={'tr-no-data'}>
                                            <td colSpan={20}>
                                                <NoDataBlock primaryText={' '}
                                                             secondaryText={'No data available'}/>
                                            </td>
                                        </tr>

                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination table={table} pageLength={pageLength}/>
                    </>
                )
            }
        </>
    );
});

Table.displayName = "Table";

export default Table;
