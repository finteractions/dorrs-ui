import React from 'react';
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import NoDataBlock from "@/components/no-data-block";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from '../table/table';
import {IForgeGlobalLastSale} from "@/interfaces/i-forge-global-last-sale";
import forgeGlobalService from "@/services/forge-global/forge-global-service";
import LoaderBlock from "@/components/loader-block";
import {FormStatus} from "@/enums/form-status";
import AlertBlock from "@/components/alert-block";


interface PendingLastSaleReportingFormState extends IState {
    loading: boolean;
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    data: Array<IForgeGlobalLastSale>;
}

interface LastSaleReportingFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISymbol | null;
    symbolData: ISymbol | null;
    onCancel?: () => void;
    readonly?: boolean;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const dateFormat = process.env.FORMAT_DATE || 'YYYY-MM-DD';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class PendingLastSaleReportingForm extends React.Component<LastSaleReportingFormProps, PendingLastSaleReportingFormState> {
    state: PendingLastSaleReportingFormState;

    constructor(props: LastSaleReportingFormProps) {
        super(props);
        this.state = {
            success: false,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            data: []
        };

        columns = [
            columnHelper.accessor((row) => row.quantity, {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Quantity</span>,
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
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue(), 'MM/dd/yyyy'),
                header: () => <span>Date</span>,
            }),
        ]
    }

    handleSubmit = async (values: ICompanyProfile, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {

    };

    componentDidMount() {
        this.setState({loading: true});
        this.getLastSales();

    }

    getLastSales() {
        forgeGlobalService.getLastSale(this.props.symbolData?.record_id)
            .then((res: Array<IForgeGlobalLastSale>) => {
                let data = res || [];


                this.setState({data: data});
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    isShow(): boolean {
        return this.props?.action === 'view';
    }

    handleApprove = async (values: any) => {
        this.setState({loading: true});
        const request: Promise<any> = forgeGlobalService.approveLastSales(this.props.symbolData?.record_id || 0, this.state.isApproving || false);

        await request
            .then(((res: any) => {
                this.props.onCallback(false);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading: false}))
    };

    isDisable() {
        return this.props.data?.status.toLowerCase() !== FormStatus.APPROVED
    }


    render() {
        return (
            <>
                <div className={'order-block__item mt-4'}>
                    <div className={'panel'}>
                        {!this.props.data?.is_last_sale_updated && (
                            <div className='approve-form'>
                                <>
                                    {this.isDisable() && (
                                        <AlertBlock className={'flex-1-1-100'} type={'info'}
                                                    messages={["To import Last Sales, please approve the symbol first."]}/>
                                    )}
                                    {this.state.data.length ? (
                                        <div
                                            className='approve-form-confirm-title mb-2 flex-1-1-100'>Do you want to
                                            import
                                            Last Sales and enable automatic import of future Last Sales records?
                                        </div>
                                    ) : (
                                        <div
                                            className='approve-form-confirm-title mb-2 flex-1-1-100'>Do you want to
                                            enable
                                            automatic import of future Last Sales records?
                                        </div>
                                    )}
                                    <div className='approve-form-confirm'>
                                        {this.state.isConfirmedApproving ? (
                                            <>
                                                <div
                                                    className='approve-form-confirm-title mb-2'>Are
                                                    you sure you want
                                                    to {this.state.isApproving ? 'approve' : 'reject'}?
                                                </div>
                                                <button
                                                    className={`b-btn ripple ${this.state.loading || this.isDisable()}`}
                                                    type="button"
                                                    disabled={this.state.loading || this.isDisable()}
                                                    onClick={() => this.handleApprove(this.props.data)}>Confirm
                                                </button>
                                                <button
                                                    className={`border-btn ripple ${this.state.loading || this.isDisable()}`}
                                                    type="button"
                                                    disabled={this.state.loading || this.isDisable()}
                                                    onClick={() => this.setState({
                                                        isConfirmedApproving: false,
                                                        isApproving: null
                                                    })}>Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className={`b-btn ripple ${this.state.loading || this.isDisable()}`}
                                                    type="button"
                                                    disabled={this.state.loading || this.isDisable()}
                                                    onClick={() => this.setState({
                                                        isConfirmedApproving: true,
                                                        isApproving: true
                                                    })}>Approve
                                                </button>
                                                <button
                                                    className={`border-btn ripple ${this.state.loading || this.isDisable()}`}
                                                    type="button"
                                                    disabled={this.state.loading || this.isDisable()}
                                                    onClick={() => this.setState({
                                                        isConfirmedApproving: true,
                                                        isApproving: false
                                                    })}>Reject
                                                </button>
                                            </>
                                        )}
                                    </div>


                                </>

                            </div>
                        )}

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <div className={'content__bottom'}>
                                    {this.state.data.length > 0 ? (
                                        <Table columns={columns}
                                               data={this.state.data}
                                               searchPanel={false}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={false}
                                               deleteBtn={false}
                                               pageLength={10}
                                        />
                                    ) : (
                                        <NoDataBlock
                                            primaryText="No Last Sales available yet"/>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </>
        )
    }
}

export default PendingLastSaleReportingForm;
