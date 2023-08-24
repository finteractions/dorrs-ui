import React, {useContext, useEffect, useState} from "react"
import Link from "next/link"
import Image from 'next/image'
import {useRouter} from 'next/router';
import {AuthUserContext} from "@/contextes/auth-user-context";
import {DataContext} from "@/contextes/data-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import userService from "@/services/user/user-service";
import LoaderBlock from "@/components/loader-block";

interface Menus {
    isAdmin: boolean,
    text: string,
    href: string
}

let MENU_LIST: Array<Menus> = [
    {
        isAdmin: false,
        text: 'Dashboard',
        href: "/dashboard",
    },
    {
        isAdmin: false,
        text: 'My Fiat',
        href: "/fiats",
    },
    {
        isAdmin: false,
        text: 'My Assets',
        href: "/assets",
    },
    {
        isAdmin: false,
        text: 'Bank Accounts',
        href: "/bank-accounts",
    },
    {
        isAdmin: false,
        text: 'Exchange',
        href: "/exchange",
    },
    {
        isAdmin: false,
        text: 'Transaction History',
        href: "/transactions",
    },
    {
        isAdmin: true,
        text: 'Admin Zone',
        href: "/backend/dashboard",
    }
]

let MENUS: Array<Menus> = MENU_LIST;

const NavItem = ({text, href, active}: any) => {
    return (
        <Link href={href} className={`${active ? 'active' : ''}`}>
            {text}
        </Link>
    )
}

const activeLink = (url: string, pathname: string) => pathname === url ? 'active' : '';


const PortalNav = () => {
    const [navActive, setNavActive] = useState<boolean>()
    const router = useRouter()
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

    useEffect(() => {
        MENUS = !authAdminContext.isAuthenticated() ? MENU_LIST.filter(item => !item.isAdmin) : MENU_LIST;
    }, [authAdminContext]);

    return (
        <>
            <nav className={`nav ${navActive ? 'active' : ''}`}>
                <ul>
                    {MENUS.map((menu, idx) => (
                        <li onClick={() => setNavActive(false)} key={menu.text}>
                            <NavItem active={activeLink(menu.href, router.pathname)} {...menu} />
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="header__right">
                <Link href="/profile" className="header__user">
                    {dataContext.userProfileLoading ? (
                        <>
                            <div className={'header__profile__image'}><LoaderBlock/></div>
                        </>
                    ) : (
                        <>
                            {dataContext.userProfile?.user_image ? (
                                <div className={'header__profile__image'}><img alt="Profile" src={dataContext.userProfile?.user_image}/></div>
                            ) : (
                                <Image src="/img/user.svg" width={24} height={25} alt="Profile"/>
                            )}
                        </>
                    )}



                    <span>My profile</span>
                </Link>
                <button type="button"
                        className="btn-logout ripple"
                        onClick={() => handleLogout()}
                >Log Out
                </button>
            </div>
            <div className="b-mobile">
                <div className={`menu-icon ${navActive ? 'active' : ''}`}
                     onClick={() => setNavActive(!navActive)}>
                    <div className="menu-icon__wrapper">
                        <span className="b-menu__icon">
                            <i className="b-menu__line b-menu__line_1"></i>
                            <i className="b-menu__line b-menu__line_2"></i>
                            <i className="b-menu__line b-menu__line_3"></i>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortalNav
