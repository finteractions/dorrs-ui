import React, {useContext, useEffect, useState} from "react"
import Link from "next/link"
import Image from "next/image"
import {useRouter} from 'next/router'
import {AuthAdminContext} from "@/contextes/auth-admin-context";

interface Menus {
    isAdmin: boolean,
    text: string,
    href: string,
    icon: string,
    alt: string
}

let MENU_LIST: Array<Menus> = [
    {
        text: 'Personal Data',
        href: "/profile",
        icon: '/img/pd-ico.svg',
        alt: 'Info',
        isAdmin: false
    },
    {
        text: 'Change Password',
        href: "/change-password",
        icon: '/img/lock-ico.svg',
        alt: 'Password',
        isAdmin: false
    },
    {
        text: 'Admin Zone',
        href: "/backend/dashboard",
        icon: '/img/pd-ico.svg',
        alt: 'Admin',
        isAdmin: true
    }
]

let MENUS: Array<Menus> = MENU_LIST;

const NavItem = ({text, href, icon, alt, active}: any) => {

    return (
        <Link href={href} className={`${active ? 'active' : ''}`}>
            <Image src={icon} width={24} height={24} alt={alt}/>
            {text}
        </Link>
    )
}

const activeLink = (url: string, pathname: string) => pathname === url ? 'active' : '';

const ProfileNav = () => {
    const router = useRouter();
    const authAdminContext = useContext(AuthAdminContext);

    const [menus, setMenus] = useState(MENU_LIST);

    useEffect(() => {
        setMenus(authAdminContext.isAuthenticated() ? MENU_LIST : MENU_LIST.filter(item => !item.isAdmin));
    }, [authAdminContext]);

    return (
        <ul>
            {menus.map((menu, idx) => (
                <li key={menu.alt}>
                    <NavItem active={activeLink(menu.href, router.pathname)} {...menu} />
                </li>
            ))}
        </ul>
    );
};

export default ProfileNav
