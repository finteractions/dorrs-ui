import React from 'react';
import Image from 'next/image';

interface LoaderBlockProps {
    width?: number;
    height?: number;
    className?: string;
}

class LoaderBlock extends React.Component<LoaderBlockProps> {

    width: number;
    height: number;
    className: string;

    constructor(props: {}) {
        super(props);

        this.width = this.props.width || 96;
        this.height = this.props.height || 96;
        this.className = this.props.className || '';
    }

    render() {
        return (
            <div className={`loader-block ${this.className ?? ''}`}>
                <div className="icon">
                    <Image src="/img/loader-32.svg"
                           width={this.width} height={this.height}
                           alt="Loader" priority/>
                </div>
            </div>
        )
    }
}

export default LoaderBlock;
