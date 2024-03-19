import {
    SortingState,
    useReactTable,
    getCoreRowModel,
    flexRender,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import React from "react";
import Pagination from "@/components/table/pagination";
import NoDataBlock from "@/components/no-data-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faEye, faTrashCan, faClose} from "@fortawesome/free-solid-svg-icons";
import {FormStatus} from "@/enums/form-status";
import {OrderStatus} from "@/enums/order-status";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";

const filterData = (data: any[], searchValue: string, columnFilters: { [key: string]: string }) => {
    searchValue = searchValue?.trim();

    Object.keys(columnFilters).forEach((key: string) => {
        if (columnFilters[key] === "") {
            delete columnFilters[key];
        }
    });

    if (searchValue.length > 0 || Object.keys(columnFilters).length > 0) {
        data = data.filter((rowData) => {
            const columnKeys = Object.keys(columnFilters);
            const rowKeys = Object.keys(rowData);

            if (columnKeys.length > 0) {
                return columnKeys.every((column) => {

                    return rowKeys.some((key: string) => {
                        let value =
                            typeof rowData[key] === "object" ? rowData[key]?.[column] ?? undefined : rowData[column];
                        value = (typeof value === 'undefined' || value === null ? '' : value).toString();
                        return value === columnFilters[column] && (searchValue === "" || value.toString().toLowerCase().includes(searchValue.toLowerCase()));
                    });
                });
            } else {
                return rowKeys.some((key: string) => {
                    const value = typeof rowData[key] === "object" ? rowData[key] === null ? [] : Object.values(rowData[key]).map(item => (item === null ? "" : item)) : [rowData[key]].map(item => (item === null ? "" : item));
                    return searchValue === "" || value.some((val: any) => val.toString().toLowerCase().includes(searchValue.toLowerCase()));
                });
            }

        });
        return data
    } else {
        return data;
    }
};

const Table = ({
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
               }: {
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
    className?: string
}) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [searchValue, setSearchValue] = React.useState("");
    const [originalData, setOriginalData] = React.useState(data);
    const [filteredData, setFilteredData] = React.useState(originalData);
    const [columnFilters, setColumnFilters] = React.useState<{ [key: string]: string }>({});

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
        const searchValue = e.target.value;
        setSearchValue(searchValue);
        setFilteredData(filterData(originalData, searchValue, columnFilters));
    };


    const resetFilters = () => {
        setColumnFilters({});
        setFilteredData(filterData(originalData, searchValue, columnFilters));
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
            const filteredStrings = children.filter((child: any) => typeof child === 'string');
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

    React.useEffect(() => {
        table.setPageIndex(currentPage);
    }, [filteredData, currentPage, table]);

    return (

        <>
            {!data.length ? (
                    <NoDataBlock/>
                ) :
                (
                    <>
                        {searchPanel && (
                            <div className="content__search">
                                <input
                                    type="text"
                                    className='search-filter'
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    placeholder="Search"
                                />
                            </div>
                        )}

                        <div className="table">

                            <div className='overflow-x-auto'>
                                <table className={className}>
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
                                    <tbody>
                                    {rows.map((row, idx) => (
                                        <tr key={row.id} {...rowProps?.attr?.reduce((acc, attr) => ({...acc, ...attr}), {})}
                                            className={rowProps?.className}
                                            onClick={() => {
                                                rowProps?.onCallback?.(row.original);
                                            }}
                                        >
                                            {row.getVisibleCells().map((cell, index, array) => {
                                                const cellStyle = rowProps?.row?.[idx]?.cell?.[index].style;
                                                return (
                                                    <td data-label={dataLabel(cell)}
                                                        colSpan={index === array.length - 1 && !editBtn && !deleteBtn && !viewBtn && !customBtnProps ? 2 : 1}
                                                        key={cell.id}
                                                        style={cellStyle ? { ...cellStyle } : {}}
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
                                                                onClick={() => block.openModal('view', row.original)}
                                                                className='admin-table-btn ripple'><FontAwesomeIcon
                                                                className="nav-icon" icon={faEye}/></button>
                                                        )}
                                                        {editBtn && (!access || access.edit) && (
                                                            <button
                                                                disabled={isEditButtonDisabled(row.original) || isButtonDisabled(row.original)}
                                                                onClick={() => block.openModal('edit', row.original)}
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
                                                                onClick={() => block.openModal('delete', row.original)}
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
                                        <tr>
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
};

export default Table;
