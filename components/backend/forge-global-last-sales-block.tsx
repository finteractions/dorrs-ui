import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import formatterService from "@/services/formatter/formatter-service";
import forgeGlobalService from "@/services/forge-global/forge-global-service";
import {IForgeGlobalLastSale} from "@/interfaces/i-forge-global-last-sale";
import Link from "next/link";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface ForgeGlobalLastSalesBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IForgeGlobalLastSale | null;
    formAction: string;
    data: IForgeGlobalLastSale[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
    mpid: string | null;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class ForgeGlobalLastSalesBlock extends React.Component<{}> {
    state: ForgeGlobalLastSalesBlockState;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            showSymbolForm: true,
            mpid: null
        }

        columns = [
            columnHelper.accessor((row) => ({
                link: row.page_url,
                company_name: row.company_name,
            }), {
                id: "company_name",
                cell: (item) => <Link className={'link'} href={item.getValue().link}
                                      target={'_blank'}>{item.getValue().company_name}</Link>,
                header: () => <span>Company Name</span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Price</span>,
            }),
            columnHelper.accessor((row) => row.price_changed, {
                id: "price_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Changed</span>,
            }),
            columnHelper.accessor((row) => row.date_time, {
                id: "date_time",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'company_name', placeholder: 'Company Name'},
            {key: 'date_time', placeholder: 'Date'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getLastSales();
    }

    getLastSales = () => {
        forgeGlobalService.getLastSale()
            .then((res: IForgeGlobalLastSale[]) => {
                console.log(res)
                const data = res || [];
                data.forEach(s => {
                    s.date_time = formatterService.dateTimeFormat(s.date_time, 'MM/dd/yyyy')
                })
                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }


    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Forge Global Last Sale Reporting</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <Link href="/backend/last-sales" className="border-btn">Back</Link>
                        </div>
                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.data.length ? (
                                        <Table columns={columns}
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={false}
                                               deleteBtn={false}
                                               filters={tableFilters}
                                               ref={this.tableRef}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No data available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </>
        )
    }
}

export default ForgeGlobalLastSalesBlock;
