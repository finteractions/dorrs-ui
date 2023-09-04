import Image from 'next/image'

function HomeLogo() {
    return (
        <div className="login__logo">
            <Image src="/img/logo.png" width={116.8} height={24.4} alt="Logo" priority/>
        </div>
    )
}

export default HomeLogo
