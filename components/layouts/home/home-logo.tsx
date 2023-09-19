import Image from 'next/image'
import Link from "next/link";

function HomeLogo() {
    const handleLinkClick = () => {
        const currentUrl = window.location.href;
        const urlObject = new URL(currentUrl);
        window.location.href = `${urlObject.protocol}//${urlObject.hostname}`;
    };

    return (
        <div className="login__logo">
            <a href="javascript:void(0)" onClick={handleLinkClick}>
                <Image src="/img/logo.svg" width={217} height={40} alt="Logo" priority/>
            </a>
        </div>
    )
}

export default HomeLogo
