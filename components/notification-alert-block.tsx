import React from "react";
import Image from "next/image";
import formatterService from "@/services/formatter/formatter-service";

interface NotificationAlertBlockProps {
    success: boolean;
    title?: string;
    amount?: number;
    currency?: string;
    decimals?: number;
    messages?: Array<string> | null;
    onClose?: () => void;
}

function NotificationAlertBlock(props: NotificationAlertBlockProps) {
    return (
        <div className="exchange__alert">
            <div className="exchange__alert-ico">
                {props.success ? (
                    <Image src="/img/check-ex.svg" width={38} height={26} alt="Success"/>
                ) : (
                    <Image src="/img/close-ex.svg" width={30} height={30} alt="Failed"/>
                )}
            </div>
            <div className="exchange__alert-text">
                <div className="exchange__alert-title">
                    {props.success ? props?.title ? props.title : 'Transaction was approved' : props?.title ? props.title : 'Transaction failed'}
                </div>
                {props.success ? (
                    <>
                        {props?.amount && props?.currency && (
                            <p>You will
                                get <span>{formatterService.numberFormat(props.amount, props.decimals)} {props.currency}</span>
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        {props.messages?.length && (
                            <>
                                {props.messages.map((msg: string, index: number) => (
                                    <p key={index}>{msg}</p>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
            {props?.onClose && (
                <div className="login__bottom">
                    <p>
                        <i className="icon-chevron-left"></i>
                        <button className="login__link"
                                onClick={() => props.onClose?.()}>
                            Back to Exchange
                        </button>
                    </p>
                </div>
            )}
        </div>
    )
}

export default NotificationAlertBlock
