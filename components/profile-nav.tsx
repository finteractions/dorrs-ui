import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/router'

const MENU_LIST = [
    {
        text: 'Personal Data',
        href: "/profile",
        icon: '/img/pd-ico.svg',
        alt: 'Info'
    },
    {
        text: 'Change Password',
        href: "/change-password",
        icon: '/img/lock-ico.svg',
        alt: 'Password'
    }
]

const NavItem = ({ text, href, icon, alt, active }: any) => {
    return (
        <Link href={href} className={`${active ? 'active' : ''}`}>
            <Image src={icon} width={24} height={24} alt={alt} />
            {text}
        </Link>
    )
}

const activeLink = (url: string, pathname: string) => pathname === url ? 'active' : '';

const ProfileNav = () => {
    const router = useRouter()

    return (
        <ul>
            {MENU_LIST.map((menu, idx) => (
                <li key={menu.alt}>
                    <NavItem active={activeLink(menu.href, router.pathname)} {...menu} />
                </li>
            ))}
        </ul>
    );
};

export default ProfileNav
