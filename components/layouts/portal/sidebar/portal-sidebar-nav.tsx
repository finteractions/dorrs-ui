import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronUp} from '@fortawesome/free-solid-svg-icons'
import React, {PropsWithChildren, useContext, useEffect, useState} from 'react'
import {Accordion, AccordionContext, Button, Nav, useAccordionButton} from 'react-bootstrap'
import classNames from 'classnames'
import Link from 'next/link'
import {useRouter} from "next/router";
import userPermissionService from "@/services/user/user-permission-service";
import {DataContext} from "@/contextes/data-context";
import {AuthUserContext} from "@/contextes/auth-user-context";

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
    permission_key: string;
    isPublic: boolean;
}

const MENU_LIST: MenuItem[] = [
    {
        text: 'Dashboard',
        href: "/public-dashboard",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect class="part-blue-bolder" x="4" y="4" width="7" height="7" rx="1.5" fill="#718494"/><path opacity="0.3" fill-rule="evenodd" clip-rule="evenodd" d="M13 5.5C13 4.67157 13.6716 4 14.5 4H18.5C19.3284 4 20 4.67157 20 5.5V9.5C20 10.3284 19.3284 11 18.5 11H14.5C13.6716 11 13 10.3284 13 9.5V5.5ZM4 14.5C4 13.6716 4.67157 13 5.5 13H9.5C10.3284 13 11 13.6716 11 14.5V18.5C11 19.3284 10.3284 20 9.5 20H5.5C4.67157 20 4 19.3284 4 18.5V14.5ZM14.5 13C13.6716 13 13 13.6716 13 14.5V18.5C13 19.3284 13.6716 20 14.5 20H18.5C19.3284 20 20 19.3284 20 18.5V14.5C20 13.6716 19.3284 13 18.5 13H14.5Z" fill="#718494"/></svg>`,
        submenus: [],
        permission_key: '',
        isPublic: true,
    },
    {
        text: 'Directory',
        href: "/public-directory",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM8 8h12v3H4V8h4zM4 19v-6h6v2h4v-2h6l.001 6H4z"></path></svg>`,
        submenus: [],
        permission_key: '',
        isPublic: true,
    },
    {
        text: 'Report Data',
        href: "/dashboard",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M12 4C6.486 4 2 8.486 2 14a9.89 9.89 0 0 0 1.051 4.445c.17.34.516.555.895.555h16.107c.379 0 .726-.215.896-.555A9.89 9.89 0 0 0 22 14c0-5.514-4.486-10-10-10zm7.41 13H4.59A7.875 7.875 0 0 1 4 14c0-4.411 3.589-8 8-8s8 3.589 8 8a7.875 7.875 0 0 1-.59 3z"></path><path d="M10.939 12.939a1.53 1.53 0 0 0 0 2.561 1.53 1.53 0 0 0 2.121-.44l3.962-6.038a.034.034 0 0 0 0-.035.033.033 0 0 0-.045-.01l-6.038 3.962z"></path></svg>`,
        submenus: [],
        permission_key: '',
        isPublic: false,
    },
    {
        text: 'Quote Board',
        href: "/quote-board",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z"></path><path d="M7 9h10v2H7zm0 4h5v2H7z"></path></svg>`,
        submenus: [],
        permission_key: 'quote_board',
        isPublic: false,
    },
    {
        text: 'Data Feed Providers',
        href: "/data-feed-providers",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M19 20.001C19 11.729 12.271 5 4 5v2c7.168 0 13 5.832 13 13.001h2z"></path><path d="M12 20.001h2C14 14.486 9.514 10 4 10v2c4.411 0 8 3.589 8 8.001z"></path><circle cx="6" cy="18" r="2"></circle></svg>`,
        submenus: [],
        permission_key: 'data_feed_providers',
        isPublic: false,
    },
    {
        text: 'Symbols',
        href: "/symbols",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>`,
        submenus: [],
        permission_key: 'security',
        isPublic: false,
    },
    {
        text: 'Asset Profiles',
        href: "/asset-profiles",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M2.165 19.551c.186.28.499.449.835.449h15c.4 0 .762-.238.919-.606l3-7A.998.998 0 0 0 21 11h-1V7c0-1.103-.897-2-2-2h-6.1L9.616 3.213A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14h.007a1 1 0 0 0 .158.551zM17.341 18H4.517l2.143-5h12.824l-2.143 5zM18 7v4H6c-.4 0-.762.238-.919.606L4 14.129V7h14z"></path></svg>`,
        submenus: [],
        permission_key: 'company_profile',
        isPublic: false,
    },
    {
        text: 'Last Sale Reporting',
        href: "/last-sale-reporting",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h7v14H4zm9 0V5h7l.001 14H13z"></path><path d="M15 7h3v2h-3zm0 4h3v2h-3z"></path></svg>`,
        submenus: [],
        permission_key: 'last_sale_reporting',
        isPublic: false,
    },
    {
        text: 'Best Bid and Best Offer',
        href: "/best-bid-and-best-offer",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M21 3h-7a2.98 2.98 0 0 0-2 .78A2.98 2.98 0 0 0 10 3H3a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h5.758c.526 0 1.042.214 1.414.586l1.121 1.121c.009.009.021.012.03.021.086.079.182.149.294.196h.002a.996.996 0 0 0 .762 0h.002c.112-.047.208-.117.294-.196.009-.009.021-.012.03-.021l1.121-1.121A2.015 2.015 0 0 1 15.242 20H21a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.758 18H4V5h6c.552 0 1 .449 1 1v12.689A4.032 4.032 0 0 0 8.758 18zM20 18h-4.758c-.799 0-1.584.246-2.242.689V6c0-.551.448-1 1-1h6v13z"></path></svg>`,
        submenus: [],
        permission_key: 'bbo',
        isPublic: false,
    },
    {
        text: 'Depth of Book',
        href: "/depth-of-book",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M21 8c-.202 0-4.85.029-9 2.008C7.85 8.029 3.202 8 3 8a1 1 0 0 0-1 1v9.883a1 1 0 0 0 .305.719c.195.188.48.305.729.28l.127-.001c.683 0 4.296.098 8.416 2.025.016.008.034.005.05.011.119.049.244.083.373.083s.254-.034.374-.083c.016-.006.034-.003.05-.011 4.12-1.928 7.733-2.025 8.416-2.025l.127.001c.238.025.533-.092.729-.28.194-.189.304-.449.304-.719V9a1 1 0 0 0-1-1zM4 10.049c1.485.111 4.381.48 7 1.692v7.742c-3-1.175-5.59-1.494-7-1.576v-7.858zm16 7.858c-1.41.082-4 .401-7 1.576v-7.742c2.619-1.212 5.515-1.581 7-1.692v7.858z"></path><circle cx="12" cy="5" r="3" ></circle></svg>`,
        submenus: [],
        permission_key: 'dob',
        isPublic: false,
    },
    {
        text: 'Weekly and Monthly Reports',
        href: "/weekly-and-monthly-reports",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M19.903 8.586a.997.997 0 0 0-.196-.293l-6-6a.997.997 0 0 0-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 0 0-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.952.952 0 0 0-.051-.259c-.01-.032-.019-.063-.033-.093zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 0 0 1 1h5l.002 10H6z"></path><path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h2v2H8z"></path></svg>`,
        submenus: [],
        permission_key: 'weekly_and_monthly_reports',
        isPublic: true,
    },
    {
        text: 'Fees',
        href: "/fees",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M12 15c-1.84 0-2-.86-2-1H8c0 .92.66 2.55 3 2.92V18h2v-1.08c2-.34 3-1.63 3-2.92 0-1.12-.52-3-4-3-2 0-2-.63-2-1s.7-1 2-1 1.39.64 1.4 1h2A3 3 0 0 0 13 7.12V6h-2v1.09C9 7.42 8 8.71 8 10c0 1.12.52 3 4 3 2 0 2 .68 2 1s-.62 1-2 1z"></path><path d="M5 2H2v2h2v17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4h2V2H5zm13 18H6V4h12z"></path></svg>`,
        submenus: [],
        permission_key: '',
        isPublic: false,
    },
    {
        text: 'Invoices',
        href: "/invoices",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M20 3H5C3.346 3 2 4.346 2 6v12c0 1.654 1.346 3 3 3h15c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19c-.552 0-1-.449-1-1V6c0-.551.448-1 1-1h15v3h-6c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h6.001v3H5zm15-9v4h-6v-4h6z"></path></svg>`,
        submenus: [],
        permission_key: '',
        isPublic: false,
    },
    {
        text: 'Algorand Data Feed',
        href: "/algorand-data-feed",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(113, 132, 148, 1);transform: ;msFilter:;"><path d="M19 3c-1.654 0-3 1.346-3 3 0 .502.136.968.354 1.385l-1.116 1.302A3.976 3.976 0 0 0 13 8c-.739 0-1.425.216-2.02.566L9.566 7.152A3.449 3.449 0 0 0 10 5.5C10 3.57 8.43 2 6.5 2S3 3.57 3 5.5 4.57 9 6.5 9c.601 0 1.158-.166 1.652-.434L9.566 9.98A3.972 3.972 0 0 0 9 12c0 .997.38 1.899.985 2.601l-1.692 1.692.025.025A2.962 2.962 0 0 0 7 16c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3c0-.476-.121-.919-.318-1.318l.025.025 1.954-1.954c.421.15.867.247 1.339.247 2.206 0 4-1.794 4-4a3.96 3.96 0 0 0-.439-1.785l1.253-1.462c.364.158.764.247 1.186.247 1.654 0 3-1.346 3-3s-1.346-3-3-3zM7 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 5.5C5 4.673 5.673 4 6.5 4S8 4.673 8 5.5 7.327 7 6.5 7 5 6.327 5 5.5zm8 8.5c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm6-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>`,
        submenus: [],
        permission_key: 'algorand_data_feed',
        isPublic: false,
    },
]
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
                <Nav.Link className={`${active ? 'active' : ''} px-3 py-2 d-flex align-items-center`}
                          onClick={() => window.dispatchEvent(new Event("hideSidebar"))}>
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

const activeLink = (url: string, pathname: string) => {
    const path = `/${pathname.split('/')[1]}` || pathname
    return path === url ? 'active' : '';
}

export default function PortalSidebarNav() {
    const [menus, setMenus] = useState(MENU_LIST);
    const authUserContext = useContext(AuthUserContext);
    const dataContext = useContext(DataContext);
    const router = useRouter();

    useEffect(() => {
        let menus = !authUserContext.isAuthenticated() ? MENU_LIST.filter(item => item.isPublic) : MENU_LIST;
        setMenus(menus)
    }, [authUserContext]);

    return (

        <ul className="list-unstyled">
            {userPermissionService.filterMenuByAccess(menus, dataContext?.userProfile?.access).map((menu: MenuItem, idx) => (
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
