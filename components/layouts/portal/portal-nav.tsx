import React, {PropsWithChildren, useContext} from "react"
import Link from "next/link"
import Image from 'next/image'
import {AuthUserContext} from "@/contextes/auth-user-context";
import {DataContext} from "@/contextes/data-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import userService from "@/services/user/user-service";
import LoaderBlock from "@/components/loader-block";
import {Dropdown, Nav, NavItem} from "react-bootstrap";
import {faUser, faBuilding} from "@fortawesome/free-regular-svg-icons";
import {faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import ThemeToggle from "@/components/layouts/portal/theme-toggle";
import UserImage from "@/components/user-image";


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

const PortalNav = () => {
    const authUserContext = useContext(AuthUserContext);
    const authAdminContext = useContext(AuthAdminContext);
    const dataContext = useContext(DataContext)
    const handleLogout = (): void => {
        userService.logout()
            .finally(() => {
                authUserContext.clearAuthInfo();
                authAdminContext.clearAuthInfo();
                dataContext.clearUserData();
            });
    }


    return (
        <>


            <Nav className={'justify-content-end align-items-center portal-navbar'}>
                <NavItem>
                    <ThemeToggle/>
                </NavItem>
                {/*<NavItem>*/}
                {/*    <div className={'portal-navbar-widget disable'}>*/}
                {/*        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                {/*            <path opacity="0.3"*/}
                {/*                  d="M21 19H3C2.4 19 2 18.6 2 18V6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6V18C22 18.6 21.6 19 21 19Z"*/}
                {/*                  fill="#718494"/>*/}
                {/*            <path*/}
                {/*                d="M21 5H3.00005C2.70005 5 2.50005 5.10005 2.30005 5.30005L11.2001 13.3C11.7001 13.7 12.4 13.7 12.8 13.3L21.7 5.30005C21.5 5.10005 21.3 5 21 5Z"*/}
                {/*                fill="#718494"/>*/}
                {/*        </svg>*/}
                {/*    </div>*/}
                {/*</NavItem>*/}
                {/*<NavItem>*/}
                {/*    <div className={'portal-navbar-widget event disable'}>*/}
                {/*        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                {/*            <path opacity="0.3"*/}
                {/*                  d="M12 22C13.6569 22 15 20.6569 15 19C15 17.3431 13.6569 16 12 16C10.3431 16 9 17.3431 9 19C9 20.6569 10.3431 22 12 22Z"*/}
                {/*                  fill="#718494"/>*/}
                {/*            <path*/}
                {/*                d="M19 15V18C19 18.6 18.6 19 18 19H6C5.4 19 5 18.6 5 18V15C6.1 15 7 14.1 7 13V10C7 7.6 8.7 5.6 11 5.1V3C11 2.4 11.4 2 12 2C12.6 2 13 2.4 13 3V5.1C15.3 5.6 17 7.6 17 10V13C17 14.1 17.9 15 19 15ZM11 10C11 9.4 11.4 9 12 9C12.6 9 13 8.6 13 8C13 7.4 12.6 7 12 7C10.3 7 9 8.3 9 10C9 10.6 9.4 11 10 11C10.6 11 11 10.6 11 10Z"*/}
                {/*                fill="#718494"/>*/}
                {/*        </svg>*/}
                {/*    </div>*/}
                {/*</NavItem>*/}
                <Dropdown as={NavItem}>
                    <Dropdown.Toggle variant="link" bsPrefix="hide-caret"
                                     className="d-flex align-items-center portal-navbar-widget-user">

                        {dataContext.userProfileLoading ? (
                            <>
                                <LoaderBlock width={40} height={40}/>
                            </>
                        ) : (
                            <>
                                <div className="widget-user-text">Hi, <b>{dataContext.userProfile?.first_name}</b></div>
                                <div
                                    className={`widget-user-avatar ${dataContext.userProfile?.user_image ? 'logo' : ''}`}>
                                    {dataContext.userProfile?.user_image ? (
                                        <UserImage
                                            height={'100%'} width={'100%'}
                                            src={`${dataContext.userProfile?.user_image}`}
                                            alt="Avatar"
                                        />
                                    ) : (
                                        <>{dataContext.userProfile?.first_name[0] || ''}</>
                                    )}
                                </div>
                            </>
                        )}

                    </Dropdown.Toggle>
                    <Dropdown.Menu className="pt-0">
                        <Dropdown.Header className="bg-light fw-bold rounded-top">Account</Dropdown.Header>
                        <Link href="/profile" passHref legacyBehavior>
                            <Dropdown.Item>
                                <ItemWithIcon icon={faUser}>My Profile</ItemWithIcon>
                            </Dropdown.Item>
                        </Link>

                        {authAdminContext.isAuthenticated() && (
                            <Link href="/backend/dashboard" passHref legacyBehavior>
                                <Dropdown.Item>
                                    <ItemWithIcon icon={faBuilding}>Admin Zone</ItemWithIcon>
                                </Dropdown.Item>
                            </Link>
                        )}
                        <Dropdown.Divider/>

                        <Dropdown.Item onClick={handleLogout}>
                            <ItemWithIcon icon={faPowerOff}>Logout</ItemWithIcon>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav>
        </>
    );
};

export default PortalNav
