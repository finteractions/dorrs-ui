import React from 'react';
import Image from 'next/image';

interface UserImageProps {
    alt: string;
    src: string;
    height: string;
    width: string;
}

function UserImage({alt, src, width, ...props}: UserImageProps) {
    const [imageAlt, setImageAlt] = React.useState(alt);
    const [imageSrc, setImageSrc] = React.useState(src);
    const host = `${window.location.protocol}//${window.location.host}`;

    React.useEffect(() => {
        setImageAlt(alt);
        setImageSrc(src);
    }, [alt, src]);

    return (

        <div style={{ ...props, width:width, minWidth: width,position: 'relative', overflow: "hidden", borderRadius: "50%"}}>
            <Image
                src={`${host}${imageSrc}` || '/img/avatar_gray.png'}
                alt={imageAlt}
                layout="fill"
                objectFit="cover"
                onError={(err) => {
                    // console.log(err)
                    setImageSrc('/img/avatar_gray.png')
                }}
            />
        </div>
    );
}

export default UserImage;
