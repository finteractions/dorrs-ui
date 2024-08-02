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
import React, {PropsWithChildren, useContext, useEffect, useState} from 'react'
import {IconDefinition} from '@fortawesome/fontawesome-svg-core'
import {faPowerOff} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import {AuthUserContext} from "@/contextes/auth-user-context";
import {DataContext} from "@/contextes/data-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import userService from "@/services/user/user-service";
import LoaderBlock from "@/components/loader-block";
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

export default function HeaderProfileNav() {
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
        <Nav className={'justify-content-end align-items-center'}>
            {/*<NotificationBlock isAdmin={true}/>*/}
            <Dropdown as={NavItem}>
                <Dropdown.Toggle variant="link" bsPrefix="hide-caret" className="py-0 px-2 rounded-0"
                                 id="dropdown-profile">
                    <div className="avatar position-relative">
                        {dataContext.userProfileLoading ? (
                            <>
                                <LoaderBlock width={40} height={40}/>
                            </>
                        ) : (
                            <div className={'header-block'}>
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
                            </div>
                        )}
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
