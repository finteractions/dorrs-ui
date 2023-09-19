import Image from 'next/image'
import Link from "next/link";

function HomeLogo() {
    return (
        <div className="login__logo">
            <Link href="/">
                <Image src="/img/logo.svg" width={217} height={40} alt="Logo" priority/>
            </Link>
        </div>
    )
}

export default HomeLogo
