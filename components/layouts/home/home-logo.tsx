import Image from 'next/image'

function HomeLogo() {
    return (
        <div className="login__logo">
            <Image src="/img/logo.svg" width={217} height={40} alt="Logo" priority/>
        </div>
    )
}

export default HomeLogo
