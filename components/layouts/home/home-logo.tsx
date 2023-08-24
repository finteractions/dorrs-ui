import Image from 'next/image'

function HomeLogo() {
    return (
        <div className="login__logo">
            <Image src="/img/logo.png" width={150} height={80} alt="Logo" priority/>
        </div>
    )
}

export default HomeLogo
