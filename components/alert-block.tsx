import React from 'react';
import Image from 'next/image';

interface AlertBlockProps {
    type: 'success' | 'error' | 'warning' | 'info';
    messages: Array<string>;
}

interface AlertBlockIcon {
    logo: string;
    width: number;
    height: number;
}

class AlertBlock extends React.Component<AlertBlockProps> {

    type: string;

    messages: Array<string>;

    icon: AlertBlockIcon;

    constructor(props: AlertBlockProps) {
        super(props);
        this.type = this.props.type;
        this.messages = this.props.messages;

        const icon = (type: string): AlertBlockIcon => {
            switch (type) {
                case 'success':
                    return {logo: 'check-ex.svg', width: 19, height: 13};
                case 'error':
                    return {logo: 'error.svg', width: 15, height: 15};
                case 'warning':
                    return {logo: 'warning.svg', width: 35, height: 35};
                case 'info':
                    return {logo: 'info-i.svg', width: 35, height: 35};
                default:
                    return {logo: '', width: 0, height: 0};
            }
        }
        this.icon = icon(this.type);
    }

    render() {
        return (
            <>
                {this.messages.map((message, index) => (
                    <div key={index} className={`alert-block alert-block-${this.type}`}>
                        {this.icon.logo !== '' && (
                            <div className="icon-block">
                                <div className="icon">
                                    <Image src={`/img/${this.icon.logo}`}
                                           width={this.icon.width}
                                           height={this.icon.height}
                                           alt={`icon-${this.type}`}/>
                                </div>
                            </div>
                        )}
                        <div className="message-block">{message}</div>
                    </div>
                ))}
            </>
        )
    }
}

export default AlertBlock;
