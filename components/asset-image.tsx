import React, { useEffect, useState } from 'react';
import LoaderBlock from "@/components/loader-block";

interface AssetImageProps {
    alt: string;
    src?: string;
    width?: number;
    height?: number;
}

function AssetImage({ alt, src, width, height }: AssetImageProps) {
    const [imageAlt, setImageAlt] = useState(alt);
    const [imageSrc, setImageSrc] = useState(src || '/img/no-data.png');
    const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({});
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setImageAlt(alt);
        const fallback = '/img/no-data.png';
        const safeSrc = src || fallback;
        setImageSrc(safeSrc);
        setReady(false);

        if (!src) {
            setDimensions({ width: 28, height: 28 });
            setReady(true);
            return;
        }

        const img = new window.Image();
        const resolvedSrc = src.startsWith('/media')
            ? `${window.location.protocol}//${window.location.host}${src}`
            : src;

        img.src = resolvedSrc;

        img.onload = () => {
            if (img.width > img.height) {
                setDimensions({ width: width || 40 });
            } else {
                setDimensions({ height: height || 40 });
            }
            setReady(true);
        };

        img.onerror = () => {
            setImageSrc(fallback);
            setDimensions({ width: 28, height: 28 });
            setReady(true);
        };
    }, [alt, src, width, height]);

    const finalSrc = imageSrc.startsWith('/media')
        ? `${window.location.protocol}//${window.location.host}${imageSrc}`
        : imageSrc;

    return (
        <>
            {!ready ? (
                <LoaderBlock className={'small'} width={width} height={height}/>
            ) : (
                <img
                    src={finalSrc}
                    alt={imageAlt}
                    width={imageSrc === '/img/no-data.png' ? undefined : dimensions.width}
                    height={imageSrc === '/img/no-data.png' ? height : dimensions.height}
                    onError={() => setImageSrc('/img/no-data.png')}
                    style={{ objectFit: 'contain' }}
                />
            )}
        </>
    );
}

export default AssetImage;
