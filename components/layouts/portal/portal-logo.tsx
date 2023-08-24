import Link from "next/link"
import Image from 'next/image'

function PortalLogo() {
    return (
        <Link href="/dashboard" className="b-logo">
            <Image src="/img/logo-full.png" width={75} height={40} alt="Logo" priority/>
        </Link>
    )
}

export default PortalLogo
