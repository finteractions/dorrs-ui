import React from "react";
import Image from "next/image";

interface NoDataBlockProps {
    primaryText?: string;
    secondaryText?: string;
}

function NoDataBlock(props: NoDataBlockProps) {
    return (
        <div className="bank-empty">
            <div className="bank-empty__ico">
                <Image src="/img/bank-ico.svg" width={64} height={64} alt="Bank"/>
            </div>
            <b>{props.primaryText || 'No data available'}</b>
            {props.secondaryText && (<p>{props.secondaryText}</p>)}
        </div>
    )
}

export default NoDataBlock
