import React from 'react';
import Image from 'next/image';

interface AssetImageProps {
    alt: string;
    src?: string;
    height?: number;
    width?: number;
}

function AssetImage({alt, src, ...props}: AssetImageProps) {
    const [imageAlt, setImageAlt] = React.useState(alt);
    const [imageSrc, setImageSrc] = React.useState(src || '/img/no-data.png');

    React.useEffect(() => {
        setImageAlt(alt);
        setImageSrc(src || '/img/no-data.png');
    }, [alt, src]);

    let finalSrc = imageSrc;
    if (finalSrc && finalSrc.startsWith('/media')) {
        const host = `${window.location.protocol}//${window.location.host}`;
        finalSrc = host + finalSrc;
    }

    return (
        <>
            {!props?.height ? (
                <>
                    {!src ? (
                        <Image src="/img/no-data.png" width={200} height={200} alt="Bank"/>
                    ) : (
                        <div>
                            <img
                                src={src || '/img/no-data.png'}
                                alt="Your Image"
                            />
                        </div>

                    )}
                </>
            ) : (
                <>
                    <img
                        width={props.width || undefined}
                        height={props.height || undefined}
                        src={finalSrc}
                        alt={imageAlt}
                        onError={() => setImageSrc('/img/no-data.png')}
                    />

                </>
            )}
        </>

    );
}

export default AssetImage;
