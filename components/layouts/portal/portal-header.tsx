import PortalLogo from "./portal-logo"
import PortalNav from "./portal-nav";

function PortalHeader() {
    return (
        <header className="header">
            <div className="container">
                <PortalLogo/>
                <PortalNav/>
            </div>
        </header>
    )
}

export default PortalHeader
