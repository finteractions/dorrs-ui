import React, {useEffect, useRef, useState} from 'react';
import QRCodeStyling, {Options as QRCodeStylingOptions} from 'qr-code-styling';
import LoaderBlock from '@/components/loader-block';

const qrOptions: QRCodeStylingOptions = {
    width: 160,
    height: 160,
    type: 'svg',
    data: undefined,
    image: '/img/logo-white-bg.jpg',
    margin: 0,
    qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H',
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.5,
        margin: 4,
        crossOrigin: 'anonymous',
    },
    dotsOptions: {
        color: '#a88b4a',
        type: 'dots',
        gradient: undefined,
    },
    backgroundOptions: {
        color: '#ffffff',
        gradient: undefined,
    },
    cornersSquareOptions: {
        color: '#a88b4a',
        type: 'square',
        gradient: undefined,
    },
    cornersDotOptions: {
        color: '#a88b5a',
        type: 'square',
        gradient: undefined,
    },
};

interface QrCodeProps {
    data: string;
    image?: string;
}

function QrCode(props: QrCodeProps) {
    const [isLoading, setIsLoading] = useState(true);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generateQrCode = async () => {
            setIsLoading(true);

            if (ref.current !== null) {
                while (ref.current.firstChild) {
                    ref.current.removeChild(ref.current.firstChild);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 350));

            const qrCode = new QRCodeStyling(qrOptions);
            qrCode.append(ref.current!);

            let options = {
                data: props.data
            }
            if (props?.image) {
                Object.assign(options, { image: props.image })
            }
            await qrCode?.update(options)

            setIsLoading(false);
        };

        generateQrCode();
    }, [props.data, props.image]);

    return (
        <div style={{width: qrOptions.width, height: qrOptions.height, margin: "auto", display: "flex"}}>
            {isLoading && <LoaderBlock/>}
            <div className={isLoading ? 'hidden' : ''} ref={ref}/>
        </div>
    );
}

export default QrCode;
