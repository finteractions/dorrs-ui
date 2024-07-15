import Link from "next/link"
import Image from 'next/image'

function PublicLogo() {
    return (
        <Link href="/dashboard" className="b-logo">
            <Image src="/img/logo.svg" width={217} height={40} alt="Logo" priority/>
        </Link>
    )
}

export default PublicLogo
