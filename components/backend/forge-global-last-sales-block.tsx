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

const columnListHelper = createColumnHelper<any>();
let listColumns: any[] = [];
let tableListFilters: Array<ITableFilter> = [];

const columnByCopmanyHelper = createColumnHelper<any>();
let byCompanyColumns: any[] = [];
let tableByCompanyFilters: Array<ITableFilter> = []

interface ForgeGlobalLastSalesBlockState {
    loading: boolean;
    dataList: IForgeGlobalLastSale[];
    dataByCompany: IForgeGlobalLastSale[];
    listErrors: string[];
    byCompanyErrors: string[];
    lastCollectedDate: string;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class ForgeGlobalLastSalesBlock extends React.Component<{}> {
    state: ForgeGlobalLastSalesBlockState;

    tableListRef: React.RefObject<any> = React.createRef();
    tableByCompanyRef: React.RefObject<any> = React.createRef();

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            dataList: [],
            dataByCompany: [],
            listErrors: [],
            byCompanyErrors: [],
            lastCollectedDate: "",
        }

        listColumns = [
            columnListHelper.accessor((row) => ({
                link: row.page_url,
                company_name: row.company_name,
            }), {
                id: "company_name",
                cell: (item) => <Link className={'link'} href={item.getValue().link}
                                      target={'_blank'}>{item.getValue().company_name}</Link>,
                header: () => <span>Company Name</span>,
            }),
            columnListHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Price</span>,
            }),
            columnListHelper.accessor((row) => row.price_changed, {
                id: "price_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Changed</span>,
            }),
            columnListHelper.accessor((row) => row.date_time, {
                id: "date_time",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
        ];

        tableListFilters = [
            {key: 'company_name', placeholder: 'Company Name'},
            {key: 'date_time', placeholder: 'Date'},
        ]

        byCompanyColumns = [
            columnByCopmanyHelper.accessor((row) => ({
                link: row.page_url,
                company_name: row.company_name,
            }), {
                id: "company_name",
                cell: (item) => <Link className={'link'} href={item.getValue().link}
                                      target={'_blank'}>{item.getValue().company_name}</Link>,
                header: () => <span>Company Name</span>,
            }),
            columnByCopmanyHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Price</span>,
            }),
            columnByCopmanyHelper.accessor((row) => row.price_changed, {
                id: "price_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Changed</span>,
            }),
            columnByCopmanyHelper.accessor((row) => row.first_date, {
                id: "first_date",
                cell: (item) => item.getValue(),
                header: () => <span>First Date</span>,
            }),
            columnByCopmanyHelper.accessor((row) => row.last_date, {
                id: "last_date",
                cell: (item) => item.getValue(),
                header: () => <span>Last Date</span>,
            }),
            columnByCopmanyHelper.accessor((row) => row.total_records, {
                id: "total_records",
                cell: (item) => formatterService.numberFormat(item.getValue(),0),
                header: () => <span># Records</span>,
            }),
        ];

        tableByCompanyFilters = [
            {key: 'company_name', placeholder: 'Company Name'},
            {key: 'first_date', placeholder: 'First Date'},
            {key: 'last_date', placeholder: 'Last Date'},
        ]
    }

    async componentDidMount() {
        this.setState({loading: true});
        await this.getLastSales()
            .then(() => this.getLastSalesByCompany())
            .then(() => this.setState({loading: false}))
    }

    getLastSales = () => {
        return new Promise((resolve, reject) => {
            forgeGlobalService.getLastSale()
                .then((res: IForgeGlobalLastSale[]) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.date_time = formatterService.dateTimeFormat(s.date_time, 'MM/dd/yyyy')
                    })
                    this.setState({dataList: data});
                })
                .catch((errors: IError) => {
                    this.setState({listErrors: errors.messages});
                })
                .finally(() => {
                    resolve(true);
                });
        })
    }

    getLastSalesByCompany = () => {
        return new Promise((resolve, reject) => {
            forgeGlobalService.getLastSaleByCompany()
                .then((res: any[]) => {
                    const data = res || [];

                    let finalDateStr = '';
                    if (data.length > 0) {
                        const maxDate = new Date(Math.max(
                            ...data.map(s => new Date(s.last_date).getTime())
                        ));

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const maxDateOnly = new Date(maxDate);
                        maxDateOnly.setHours(0, 0, 0, 0);

                        const diffInDays = Math.floor(
                            (today.getTime() - maxDateOnly.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        const finalDate = (diffInDays === 1) ? today : maxDate;
                        finalDateStr = formatterService.dateTimeFormat(finalDate.toISOString(), 'MM/dd/yyyy');

                        data.forEach(s => {
                            s.first_date = formatterService.dateTimeFormat(s.first_date, 'MM/dd/yyyy');
                            s.last_date = formatterService.dateTimeFormat(s.last_date, 'MM/dd/yyyy');
                        });
                    }

                    this.setState({
                        dataByCompany: data,
                        lastCollectedDate: finalDateStr
                    });
                })
                .catch((errors: IError) => {
                    this.setState({ byCompanyErrors: errors.messages || [] });
                })
                .finally(() => {
                    resolve(true);
                });
        });
    }




    render() {
        return (

            <>
                <div className={'flex-panel-box'}>
                    <div className={'panel'}>
                        <div className="content__top">
                            <div className="content__title">Forge Global Last Sale Reporting</div>
                            <div
                                className="content__title_btns content__filter download-buttons justify-content-end">
                                <Link href="/backend/last-sales" className="border-btn">Back</Link>
                            </div>
                        </div>


                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <ul className="nav nav-tabs" id="tabs">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="list-tab" data-bs-toggle="tab"
                                           href="#list">All</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="by-company-tab" data-bs-toggle="tab"
                                           href="#by_company">By
                                            Company</a>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    <div className="tab-pane fade show active mt-24" id="list">
                                        {this.state.dataList.length ? (
                                            <Table columns={listColumns}
                                                   pageLength={pageLength}
                                                   data={this.state.dataList}
                                                   searchPanel={true}
                                                   block={this}
                                                   viewBtn={false}
                                                   editBtn={false}
                                                   deleteBtn={false}
                                                   filters={tableListFilters}
                                                   ref={this.tableListRef}
                                            />
                                        ) : (
                                            <>
                                                {this.state.listErrors.length ? (
                                                    <AlertBlock type="error" messages={this.state.listErrors}/>
                                                ) : (
                                                    <NoDataBlock primaryText="No data available yet"/>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="tab-pane fade mt-24" id="by_company">
                                        {this.state.lastCollectedDate && (
                                            <div className={'my-4 d-flex justify-content-end'}>
                                                Forge Global sync date:  {this.state.lastCollectedDate}
                                            </div>
                                        )}

                                        {this.state.dataByCompany.length ? (
                                            <Table columns={byCompanyColumns}
                                                   pageLength={pageLength}
                                                   data={this.state.dataByCompany}
                                                   searchPanel={true}
                                                   block={this}
                                                   viewBtn={false}
                                                   editBtn={false}
                                                   deleteBtn={false}
                                                   filters={tableByCompanyFilters}
                                                   ref={this.tableByCompanyRef}
                                            />
                                        ) : (
                                            <>
                                                {this.state.byCompanyErrors.length ? (
                                                    <AlertBlock type="error" messages={this.state.byCompanyErrors}/>
                                                ) : (
                                                    <NoDataBlock primaryText="No data available yet"/>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                </div>
            </>
        )
    }
}

export default ForgeGlobalLastSalesBlock;
