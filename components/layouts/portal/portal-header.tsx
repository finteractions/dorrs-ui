import PortalNav from "./portal-nav";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";

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
            <PortalNav/>

        </header>
    )
}

export default PortalHeader
