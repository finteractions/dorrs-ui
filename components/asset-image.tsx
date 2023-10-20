import React from 'react';
import Image from 'next/image';

interface AssetImageProps {
    alt: string;
    src: string;
    height: number;
    width: number;
}

function AssetImage({alt, src, ...props}: AssetImageProps) {
    console.log(src)
    const [imageAlt, setImageAlt] = React.useState(alt);
    const [imageSrc, setImageSrc] = React.useState(src);

    React.useEffect(() => {
        setImageAlt(alt);
        setImageSrc(src);
    }, [alt, src]);

    return (
        <Image
            {...props}
            src={imageSrc || '/img/image-error.png'}
            alt={imageAlt}
            onError={() => setImageSrc('/img/image-error.png')}
        />
    );
}

export default AssetImage;
