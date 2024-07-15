import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars,} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import React, {useContext} from "react";
import PortalNav from "@/components/layouts/portal/portal-nav";
import {AuthUserContext} from "@/contextes/auth-user-context";
import PublicLogo from "@/components/layouts/public/public-logo";

type HeaderProps = {
    toggleSidebar: () => void;
}

function PublicHeader(props: HeaderProps) {
    const authUserContext = useContext(AuthUserContext);

    return (
        <header className="header sticky-top">
            <Button
                variant="link"
                className="d-md-none header-menu-btn"
                type="button"
                onClick={props.toggleSidebar}
            >
                <FontAwesomeIcon icon={faBars}/>
            </Button>
            <div className={'sidebar'}>
                <div className={'sidebar-brand d-flex align-items-center justify-content-center'}>
                    <PublicLogo/>
                </div>

            </div>
            <PortalNav/>

        </header>
    )
}

export default PublicHeader
