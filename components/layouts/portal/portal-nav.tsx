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
import {faArrowRightToBracket, faGauge, faPowerOff, faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import ThemeToggle from "@/components/layouts/portal/theme-toggle";
import UserImage from "@/components/user-image";
import NotificationBlock from "@/components/notification-block";


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

                {/*<NotificationBlock isAdmin={false}/>*/}
                {authUserContext.isAuthenticated() ? (
                    <>
                        <Dropdown as={NavItem}>
                            <Dropdown.Toggle variant="link" bsPrefix="hide-caret"
                                             className="d-flex align-items-center portal-navbar-widget-user">

                                {dataContext.userProfileLoading ? (
                                    <>
                                        <LoaderBlock width={40} height={40}/>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className="widget-user-text">Hi, <b>{dataContext.userProfile?.first_name}</b>
                                        </div>
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
                    </>
                ) : (
                    <div className={'d-flex gap-10'}>
                        <Link className="d-none d-md-flex b-btn ripple d-flex align-items-center align-self-center"
                              href={'/registration'}
                        ><span>Registration</span>
                        </Link>
                        <Link
                            className={'d-md-none b-btn ripple d-flex align-items-center align-self-center'}
                            type="button"
                            href={'/registration'}
                        >
                            <FontAwesomeIcon icon={faUserPlus}/>
                        </Link>

                        <Link className="d-none d-md-flex b-btn ripple d-flex align-items-center align-self-center"
                              href={'/login'}
                        ><span>Login</span>
                        </Link>
                        <Link
                            className={'d-md-none b-btn ripple d-flex align-items-center align-self-center'}
                            type="button"
                            href={'/login'}
                        >
                            <FontAwesomeIcon icon={faArrowRightToBracket}/>
                        </Link>
                    </div>
                )}

            </Nav>
        </>
    );
};

export default PortalNav
