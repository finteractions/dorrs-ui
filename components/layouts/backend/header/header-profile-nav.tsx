import {
    Badge, Dropdown, Nav, NavItem,
} from 'react-bootstrap'
import Image from 'next/image'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBell,
    faCreditCard,
    faEnvelopeOpen,
    faFile,
    faMessage,
    faUser,
} from '@fortawesome/free-regular-svg-icons'
import {PropsWithChildren, useContext, useEffect, useState} from 'react'
import {IconDefinition} from '@fortawesome/fontawesome-svg-core'
import {faPowerOff} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import {AuthUserContext} from "@/contextes/auth-user-context";
import {DataContext} from "@/contextes/data-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import userService from "@/services/user/user-service";

type ItemWithIconProps = {
    icon: IconDefinition;
} & PropsWithChildren

const ItemWithIcon = (props: ItemWithIconProps) => {
    const {icon, children} = props

    return (
        <>
            <FontAwesomeIcon className="me-2" icon={icon} fixedWidth/>
            {children}
        </>
    )
}

export default function HeaderProfileNav() {
    const authUserContext = useContext(AuthUserContext);
    const authAdminContext = useContext(AuthAdminContext);

    const [userName, setUserName] = useState<string | null>(null);
    const handleLogout = (): void => {
        userService.logout()
            .finally(() => {
                authUserContext.clearAuthInfo();
                authAdminContext.clearAuthInfo();
        });

    }

    useEffect(() => {
        if (authAdminContext.isAuthenticated()) {
            setUserName(authAdminContext.authState.user_id)
        }

    }, [authAdminContext]);

    return (
        <Nav>
            <Dropdown as={NavItem}>
                <Dropdown.Toggle variant="link" bsPrefix="hide-caret" className="py-0 px-2 rounded-0"
                                 id="dropdown-profile">
                    <div className="avatar position-relative">
                        <Image
                            fill
                            className="rounded-circle"
                            src="/img/avatar.png"
                            alt="avatar"
                        />
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="pt-0">
                    <Dropdown.Header className="bg-light fw-bold rounded-top">Account</Dropdown.Header>
                    <Link href="/dashboard" passHref legacyBehavior>
                        <Dropdown.Item>
                            <ItemWithIcon icon={faUser}>Portal</ItemWithIcon>
                        </Dropdown.Item>
                    </Link>

                    <Dropdown.Divider/>

                    <Dropdown.Item onClick={handleLogout}>
                        <ItemWithIcon icon={faPowerOff}>Logout</ItemWithIcon>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </Nav>
    )
}
