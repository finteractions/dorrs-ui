import React from 'react';
import {ICustody} from "@/interfaces/i-custody";
import formatterService from "@/services/formatter/formatter-service";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";

interface TransactionFormState extends IState {
    mode: string;
    isConfirmedApproving: boolean;
    loading: boolean;
    isApproving: boolean | null;
    data: ICustody | null;
    isFiatBaseCurrency: boolean;
    isFiatQuoteCurrency: boolean;
    loadingBaseCurrency: boolean;
    loadingQuoteCurrency: boolean;
}

interface TransactionFormProps extends ICallback{
    action: string;
    data: ICustody | null;
    onCancel?: () => void;
}

class TransactionForm extends React.Component<TransactionFormProps, TransactionFormState> {
    commentTextarea = React.createRef<HTMLTextAreaElement>();
    state: TransactionFormState;

    constructor(props: TransactionFormProps) {
        super(props);

        this.state = {
            success: false,
            mode: this.props.action,
            isConfirmedApproving: false,
            loading: false,
            isApproving: null,
            data: this.props.data,
            isFiatBaseCurrency: false,
            isFiatQuoteCurrency: false,
            loadingBaseCurrency: true,
            loadingQuoteCurrency: true
        };
    }

    componentDidMount() {
        this.checkAsset();
    }

    checkAsset = () => {
        if (this.state.data?.base_currency){
            adminService.getAsset(this.state.data?.base_currency || '')
                .then((res: IAdminAsset[]) => {
                    this.setState({isFiatBaseCurrency: (res[0].currency_type.toLowerCase() === 'fiat')})
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages})
                })
                .finally(() => {
                    this.setState({loadingBaseCurrency: false})
                });
        }else {
            this.setState({isFiatBaseCurrency: true, loadingBaseCurrency: false})
        }

        if (this.state.data?.quote_currency) {
            adminService.getAsset(this.state.data?.quote_currency || '')
                .then((res: IAdminAsset[]) => {
                    this.setState({isFiatQuoteCurrency: (res[0].currency_type.toLowerCase() === 'fiat')})
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages})
                })
                .finally(() => {
                    this.setState({loadingQuoteCurrency: false})
                });
        }else {
            this.setState({isFiatQuoteCurrency: true ,loadingQuoteCurrency: false})
        }

    }

    updateTransaction = () => {
        adminService.getTransaction(this.state.data?.id || 0)
            .then((res: ICustody) => {
                this.setState({data: res});
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
            .finally(() => {
                this.setState({loading: false, isApproving: null, isConfirmedApproving: false})
            });
    }

    handleApprove = async (values: any, comment: string) => {
        this.setState({loading: true});

        await adminService.updateFiatTransactionStatus(values.id, this.state.isApproving || false, comment)
            .then(((res: any) => {
                this.props.onCallback(values);
                this.updateTransaction();
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages, loading: false, isApproving: null, isConfirmedApproving: false})
            });
    };

    render() {

        switch (this.state.mode) {
            case "add":
            case "edit":
                return ''
            case "view":
                return (
                    <>
                        {this.state.loading || this.state.loadingBaseCurrency || this.state.loadingQuoteCurrency ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <div className='approve-form'>
                                    {this.state.isFiatBaseCurrency && this.state.isFiatQuoteCurrency ? (
                                        <>
                                            {this.state.data?.status == 'Approved' || this.state.data?.status == 'Rejected' ? (
                                                <>
                                                    <div className='approve-form-text'>Status: {this.state.data.status} {this.state.data?.approved_by ? `by ${this.state.data?.approved_by}` : ''} at {formatterService.dateTimeFormat(this.state.data?.approved_date_time || '')}</div>
                                                    {this.state.data.comment && (
                                                        <div className="approve-form-comment">
                                                            <div className="approve-form-comment-text-panel">
                                                                <div className="approve-form-comment-text-title">Comment:</div>
                                                                <div className="approve-form-comment-text-message" title={this.state.data.comment}>{this.state.data.comment}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className='approve-form-text'>Status: {this.state.data?.status || 'Pending'}</div>
                                                    <div className='approve-form-confirm'>
                                                        {this.state.isConfirmedApproving ? (
                                                            <>
                                                                <div className='approve-form-confirm-title mb-2'>Are you sure you want to {this.state.isApproving ? 'approve' : 'reject'}?</div>
                                                                <button className={`b-btn ripple`} type="button" onClick={() => this.handleApprove(this.state.data, this.commentTextarea?.current?.value ?? '')}>Confirm</button>
                                                                <button className={`border-btn ripple`} type="button" onClick={() => this.setState({isConfirmedApproving: false, isApproving: null})}>Cancel</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button className={`b-btn ripple`} type="button" onClick={() => this.setState({isConfirmedApproving: true, isApproving: true})}>Approve</button>
                                                                <button className={`border-btn ripple`} type="button" onClick={() => this.setState({isConfirmedApproving: true, isApproving: false})}>Reject</button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {this.state.isConfirmedApproving && (
                                                        <div className="approve-form-comment">
                                                            <textarea ref={this.commentTextarea} placeholder={`Comment about "${this.state.isApproving ? 'Approve' : 'Reject'}" status set reason`} rows={5}/>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className='approve-form-text'>Status: {this.state.data?.status || 'Pending'}</div>
                                    )}
                                </div>

                                <div className='view-form transaction-view-form'>
                                    <div className="view-form-box">
                                        <div className="box__title">User</div>
                                        <div className="box__wrap">{this.state.data?.user_id || ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Type</div>
                                        <div className="box__wrap">{this.state.data?.type || ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Amount</div>
                                        <div className="box__wrap">
                                            {this.state.data?.type.toLowerCase() == 'exchange' ? (
                                                <>{formatterService.numberFormat(this.state.data?.base_price)} {this.state.data?.base_currency} -&gt; {formatterService.numberFormat(this.state.data?.quote_price)} {this.state.data?.quote_currency}</>
                                            ) : (
                                                <>{formatterService.numberFormat(this.state.data?.base_price)} {this.state.data?.base_currency}</>
                                            )}
                                        </div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">From Address</div>
                                        <div className="box__wrap">{this.state.data?.from_address || ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">To Address</div>
                                        <div className="box__wrap">{this.state.data?.to_address || ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Transaction Hash</div>
                                        <div className="box__wrap">{this.state.data?.transaction_hash || ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Approved By</div>
                                        <div className="box__wrap">{this.state.data?.approved_by || ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Approved Date</div>
                                        <div
                                            className="box__wrap">{formatterService.dateTimeFormat(this.state.data?.approved_date_time || '')}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Created Date</div>
                                        <div
                                            className="box__wrap">{formatterService.dateTimeFormat(this.state.data?.date_time || '')}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )
            case "delete":
                return ''
        }
    }
}

export default TransactionForm;
