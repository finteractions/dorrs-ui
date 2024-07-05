import PortalNav from "./portal-nav";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faGauge, faPlus} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import React from "react";
import Link from "next/link";

type HeaderProps = {
    toggleSidebar: () => void;
}

function PortalHeader(props: HeaderProps) {

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
            <div className={'justify-content-end align-items-center portal-navbar nav ml-auto-none'}>
                <Link className="d-none d-md-flex b-btn ripple d-flex align-items-center align-self-center"
                      href={'/public-dashboard'}
                ><span>Dashboard</span>
                </Link>
                <Link
                    className={'d-md-none admin-table-btn ripple'}
                    type="button"
                    href={'/public-dashboard'}
                >
                    <FontAwesomeIcon icon={faGauge}/>
                </Link>
            </div>
            <PortalNav/>

        </header>
    )
}

export default PortalHeader
