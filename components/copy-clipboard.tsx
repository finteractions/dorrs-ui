import React, { useState } from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {Tooltip} from 'react-tooltip'

interface CopyClipboardProps {
    text: string;
}

function CopyClipboard(props: CopyClipboardProps) {
    const [isCopied, setIsCopied] = useState(false)

    const copyText = () => {
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 1500)
    }

    return (
        <>
            <CopyToClipboard text={props.text} onCopy={() => copyText()}>
                <button className={`btn-copy ripple ${isCopied ? 'copied' : ''}`}/>
            </CopyToClipboard>
            <Tooltip className="hint" anchorSelect=".btn-copy" content="Copy"
                     variant="light" place="top" offset={5}/>
        </>
    )
}

export default CopyClipboard
