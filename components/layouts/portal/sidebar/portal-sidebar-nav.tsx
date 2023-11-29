import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronUp, faGauge, faWallet} from '@fortawesome/free-solid-svg-icons'
import React, {PropsWithChildren, useContext, useEffect, useState} from 'react'
import {Accordion, AccordionContext, Button, Nav, useAccordionButton} from 'react-bootstrap'
import classNames from 'classnames'
import Link from 'next/link'
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import {useRouter} from "next/router";
import userPermissionService from "@/services/user/user-permission-service";
import {DataContext} from "@/contextes/data-context";

type PortalSidebarNavItemProps = {
    href: string;
    icon?: string;
    active: string;
} & PropsWithChildren

interface Submenu {
    text: string;
    href: string;
}

interface MenuItem {
    text: string;
    href: string;
    icon: string
    submenus: Array<Submenu>;
    onlyAdmin: boolean;
    permission_key: string;
}

const MENU_LIST: MenuItem[] = [
    {
        text: 'Dashboard',
        href: "/dashboard",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect class="part-blue-bolder" x="4" y="4" width="7" height="7" rx="1.5" fill="#718494"/><path opacity="0.3" fill-rule="evenodd" clip-rule="evenodd" d="M13 5.5C13 4.67157 13.6716 4 14.5 4H18.5C19.3284 4 20 4.67157 20 5.5V9.5C20 10.3284 19.3284 11 18.5 11H14.5C13.6716 11 13 10.3284 13 9.5V5.5ZM4 14.5C4 13.6716 4.67157 13 5.5 13H9.5C10.3284 13 11 13.6716 11 14.5V18.5C11 19.3284 10.3284 20 9.5 20H5.5C4.67157 20 4 19.3284 4 18.5V14.5ZM14.5 13C13.6716 13 13 13.6716 13 14.5V18.5C13 19.3284 13.6716 20 14.5 20H18.5C19.3284 20 20 19.3284 20 18.5V14.5C20 13.6716 19.3284 13 18.5 13H14.5Z" fill="#718494"/></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: ''
    },
    {
        text: 'Symbols',
        href: "/symbols",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: 'security'
    },
    {
        text: 'Last Sale Reporting',
        href: "/last-sale-reporting",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.3" x="13" y="4" width="3" height="16" rx="1.5" fill="#718494"/><rect x="8" y="9" width="3" height="11" rx="1.5" fill="#718494"/><rect x="18" y="11" width="3" height="9" rx="1.5" fill="#718494"/><rect x="3" y="13" width="3" height="7" rx="1.5" fill="#718494"/></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: 'last_sale_reporting'
    },
    {
        text: 'Best Bid and Best Offer',
        href: "/best-bid-and-best-offer",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.3" x="13" y="4" width="3" height="16" rx="1.5" fill="#718494"/><rect x="8" y="9" width="3" height="11" rx="1.5" fill="#718494"/><rect x="18" y="11" width="3" height="9" rx="1.5" fill="#718494"/><rect x="3" y="13" width="3" height="7" rx="1.5" fill="#718494"/></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: 'bbo'
    },
    {
        text: 'Company Profile',
        href: "/company-profile",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Library"><path id="Combined Shape" fill-rule="evenodd" clip-rule="evenodd" d="M5 2.99951C4.44772 2.99951 4 3.44723 4 3.99951V19.9995C4 20.5518 4.44772 20.9995 5 20.9995H6C6.55228 20.9995 7 20.5518 7 19.9995V3.99951C7 3.44723 6.55228 2.99951 6 2.99951H5ZM10 2.99951C9.44772 2.99951 9 3.44723 9 3.99951V19.9995C9 20.5518 9.44772 20.9995 10 20.9995H11C11.5523 20.9995 12 20.5518 12 19.9995V3.99951C12 3.44723 11.5523 2.99951 11 2.99951H10Z" fill="#718494"/><rect id="Rectangle Copy 2" opacity="0.3" x="13.4775" y="3.92432" width="3" height="18" rx="1" transform="rotate(-19 13.4775 3.92432)" fill="#718494"/></g></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: 'company_profile'
    },
    {
        text: 'Weekly and Monthly Reports',
        href: "/weekly-and-monthly-reports",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Library"><path id="Combined Shape" fill-rule="evenodd" clip-rule="evenodd" d="M5 2.99951C4.44772 2.99951 4 3.44723 4 3.99951V19.9995C4 20.5518 4.44772 20.9995 5 20.9995H6C6.55228 20.9995 7 20.5518 7 19.9995V3.99951C7 3.44723 6.55228 2.99951 6 2.99951H5ZM10 2.99951C9.44772 2.99951 9 3.44723 9 3.99951V19.9995C9 20.5518 9.44772 20.9995 10 20.9995H11C11.5523 20.9995 12 20.5518 12 19.9995V3.99951C12 3.44723 11.5523 2.99951 11 2.99951H10Z" fill="#718494"/><rect id="Rectangle Copy 2" opacity="0.3" x="13.4775" y="3.92432" width="3" height="18" rx="1" transform="rotate(-19 13.4775 3.92432)" fill="#718494"/></g></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: 'weekly_and_monthly_reports'
    },
    {
        text: 'Tariffs',
        href: "tariffs",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Library"><path id="Combined Shape" fill-rule="evenodd" clip-rule="evenodd" d="M5 2.99951C4.44772 2.99951 4 3.44723 4 3.99951V19.9995C4 20.5518 4.44772 20.9995 5 20.9995H6C6.55228 20.9995 7 20.5518 7 19.9995V3.99951C7 3.44723 6.55228 2.99951 6 2.99951H5ZM10 2.99951C9.44772 2.99951 9 3.44723 9 3.99951V19.9995C9 20.5518 9.44772 20.9995 10 20.9995H11C11.5523 20.9995 12 20.5518 12 19.9995V3.99951C12 3.44723 11.5523 2.99951 11 2.99951H10Z" fill="#718494"/><rect id="Rectangle Copy 2" opacity="0.3" x="13.4775" y="3.92432" width="3" height="18" rx="1" transform="rotate(-19 13.4775 3.92432)" fill="#718494"/></g></svg>`,
        submenus: [],
        onlyAdmin: false,
        permission_key: 'weekly_and_monthly_reports'
    }
]

let MENUS: Array<MenuItem> = MENU_LIST;

const PortalSidebarNavItem = (props: PortalSidebarNavItemProps) => {
    const {
        icon,
        children,
        href,
        active,
    } = props

    return (
        <Nav.Item>
            <Link href={href} passHref legacyBehavior>
                <Nav.Link className={`${active ? 'active' : ''} px-3 py-2 d-flex align-items-center`}>
                    {icon ? <div dangerouslySetInnerHTML={{__html: icon}}/>
                        : <span className=""/>}
                    {children}
                </Nav.Link>
            </Link>
        </Nav.Item>
    )
}

type PortalSidebarNavGroupToggleProps = {
    eventKey: string;
    icon: string;
    setIsShow: (isShow: boolean) => void;
} & PropsWithChildren

const PortalSidebarNavGroupToggle = (props: PortalSidebarNavGroupToggleProps) => {
    const {activeEventKey} = useContext(AccordionContext)
    const {
        eventKey, icon, children, setIsShow,
    } = props

    const decoratedOnClick = useAccordionButton(eventKey)

    const isCurrentEventKey = activeEventKey === eventKey

    useEffect(() => {
        setIsShow(activeEventKey === eventKey)
    }, [activeEventKey, eventKey, setIsShow])

    return (
        <Button
            variant="link"
            type="button"
            className={classNames('rounded-0 nav-link px-3 py-2 d-flex align-items-center flex-fill w-100 shadow-none', {
                collapsed: !isCurrentEventKey,
            })}
            onClick={decoratedOnClick}
        >
            {/*<FontAwesomeIcon className="nav-icon ms-n3" icon={icon}/>*/}
            {icon && <div dangerouslySetInnerHTML={{__html: icon}}/>}
            {children}
            <div className="nav-chevron ms-auto text-end">
                <FontAwesomeIcon size="xs" icon={faChevronUp}/>
            </div>
        </Button>
    )
}

type PortalSidebarNavGroupProps = {
    toggleIcon: string;
    toggleText: string;
} & PropsWithChildren

const PortalSidebarNavGroup = (props: PortalSidebarNavGroupProps) => {
    const {
        toggleIcon,
        toggleText,
        children,
    } = props

    const [isShow, setIsShow] = useState(false)

    return (
        <Accordion as="li" bsPrefix="nav-group" className={classNames({show: isShow})}>
            <PortalSidebarNavGroupToggle icon={toggleIcon} eventKey="0"
                                         setIsShow={setIsShow}>{toggleText}</PortalSidebarNavGroupToggle>
            <Accordion.Collapse eventKey="0">
                <ul className="nav-group-items list-unstyled">
                    {children}
                </ul>
            </Accordion.Collapse>
        </Accordion>
    )
}

const activeLink = (url: string, pathname: string) => pathname === url ? 'active' : '';

export default function PortalSidebarNav() {
    const authAdminContext = useContext(AuthAdminContext);
    const dataContext = useContext(DataContext);
    const router = useRouter();

    useEffect(() => {
        MENUS = !authAdminContext.isAuthenticated() ? MENU_LIST.filter(item => !item.onlyAdmin) : MENU_LIST;
    }, [authAdminContext]);

    return (

        <ul className="list-unstyled">
            {userPermissionService.filterMenuByAccess(MENUS, dataContext.userProfile.access).map((menu: MenuItem, idx) => (
                <React.Fragment key={idx}>
                    {menu.submenus.length > 0 ? (
                        <PortalSidebarNavGroup key={idx} toggleIcon={menu.icon} toggleText={menu.text}>
                            {menu.submenus.map((subMenu, idxx) => (
                                <PortalSidebarNavItem active={activeLink(menu.href, router.pathname)} key={idxx}
                                                      href={subMenu.href}>
                                    {subMenu.text}
                                </PortalSidebarNavItem>
                            ))}
                        </PortalSidebarNavGroup>
                    ) : (
                        <PortalSidebarNavItem active={activeLink(menu.href, router.pathname)} key={idx} icon={menu.icon}
                                              href={menu.href}>
                            {menu.text}
                        </PortalSidebarNavItem>
                    )}
                </React.Fragment>
            ))}
        </ul>
    )
}
