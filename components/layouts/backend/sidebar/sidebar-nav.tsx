import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    IconDefinition,
} from '@fortawesome/free-regular-svg-icons'
import {
    faChevronUp,
    faUserTie,
    faGauge,
    faBuilding,
    faBook,
    faFileArchive,
    faHandHoldingUsd,
    faUsersRectangle,
    faRss,
    faFolderOpen,
    faTools,
    faUsers,
    faBriefcase,
    faTags,
    faReceipt,
    faBookOpen,
    faBookOpenReader,
    faFileLines,
    faWallet,
    faFileSignature,
    faHashtag
} from '@fortawesome/free-solid-svg-icons'
import React, {
    PropsWithChildren, useContext, useEffect, useState,
} from 'react'
import {
    Accordion, AccordionContext, Button, Nav, useAccordionButton,
} from 'react-bootstrap'
import classNames from 'classnames'
import Link from 'next/link'
import {DataContext} from "@/contextes/data-context";
import {Environment} from "@/enums/environment";

type SidebarNavItemProps = {
    href: string;
    icon?: IconDefinition;
} & PropsWithChildren

interface Submenu {
    text: string;
    href: string;
    icon: IconDefinition
}

interface MenuItem {
    text: string;
    href: string;
    icon: IconDefinition
    submenus: Array<Submenu>;
}

const MENU_LIST: MenuItem[] = [
    {
        text: 'Dashboard',
        href: "/backend/dashboard",
        icon: faGauge,
        submenus: []
    },
    {
        text: 'Users',
        href: '#',
        icon: faUsers,
        submenus: [
            {
                text: 'Users',
                href: "/backend/user-management",
                icon: faUserTie
            },
            {
                text: 'Activity Logs',
                href: "/backend/activity-logs",
                icon: faFileSignature
            },
        ]
    },
    {
        text: 'Firms',
        href: "/backend/firm-management",
        icon: faBuilding,
        submenus: []
    },
    {
        text: 'Public Directory',
        href: "/backend/public-directory",
        icon: faBriefcase,
        submenus: []
    },
    {
        text: 'Membership Forms',
        href: "/backend/membership-form",
        icon: faBook,
        submenus: []
    },
    {
        text: 'Symbols',
        href: '#',
        icon: faBriefcase,
        submenus: [
            {
                text: 'Symbols',
                href: "/backend/asset-management",
                icon: faTags
            },
            {
                text: 'Pending',
                href: "/backend/asset-management-pending",
                icon: faHashtag
            },
        ]
    },
    {
        text: 'Asset Profiles',
        href: "/backend/asset-profiles",
        icon: faFolderOpen,
        submenus: []
    },
    {
        text: 'Last Sale Reporting',
        href: "/backend/last-sales",
        icon: faReceipt,
        submenus: []
    },
    {
        text: 'Best Bid and Best Offer',
        href: "/backend/best-bid-and-best-offer",
        icon: faBookOpen,
        submenus: []
    },
    {
        text: 'Orders',
        href: "/backend/orders",
        icon: faBookOpenReader,
        submenus: []
    },
    {
        text: 'Data Feed Providers',
        href: "/backend/data-feed-providers",
        icon: faRss,
        submenus: []
    },
    {
        text: 'Weekly and Monthly Reports',
        href: "/backend/weekly-and-monthly-reports",
        icon: faFileLines,
        submenus: []
    },
    {
        text: 'Fees',
        href: "/backend/fees",
        icon: faHandHoldingUsd,
        submenus: []
    },
    {
        text: 'Invoices',
        href: "/backend/invoices",
        icon: faWallet,
        submenus: []
    },
    {
        text: 'Member Distribution',
        href: "/backend/member-distribution",
        icon: faUsersRectangle,
        submenus: []
    },
    {
        text: 'DOCs',
        href: "/backend/docs",
        icon: faFileArchive,
        submenus: []
    },
]

const SidebarNavItem = (props: SidebarNavItemProps) => {
    const {
        icon,
        children,
        href,
    } = props

    return (
        <Nav.Item>
            <Link href={href} passHref legacyBehavior>
                <Nav.Link className="px-3 py-2 d-flex align-items-center"
                          onClick={() => window.dispatchEvent(new Event("hideSidebar"))}>
                    {icon ? <FontAwesomeIcon className="nav-icon ms-n3" icon={icon}/>
                        : <span className="nav-icon ms-n3"/>}
                    {children}
                </Nav.Link>
            </Link>
        </Nav.Item>
    )
}

type SidebarNavGroupToggleProps = {
    eventKey: string;
    icon: IconDefinition;
    setIsShow: (isShow: boolean) => void;
} & PropsWithChildren

const SidebarNavGroupToggle = (props: SidebarNavGroupToggleProps) => {
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
            <FontAwesomeIcon className="nav-icon ms-n3" icon={icon}/>
            {children}
            <div className="nav-chevron ms-auto text-end">
                <FontAwesomeIcon size="xs" icon={faChevronUp}/>
            </div>
        </Button>
    )
}

type SidebarNavGroupProps = {
    toggleIcon: IconDefinition;
    toggleText: string;
} & PropsWithChildren

const SidebarNavGroup = (props: SidebarNavGroupProps) => {
    const {
        toggleIcon,
        toggleText,
        children,
    } = props

    const [isShow, setIsShow] = useState(false)

    return (
        <Accordion as="li" bsPrefix="nav-group" className={classNames({show: isShow})}>
            <SidebarNavGroupToggle icon={toggleIcon} eventKey="0"
                                   setIsShow={setIsShow}>{toggleText}</SidebarNavGroupToggle>
            <Accordion.Collapse eventKey="0">
                <ul className="nav-group-items list-unstyled">
                    {children}
                </ul>
            </Accordion.Collapse>
        </Accordion>
    )
}

export default function SidebarNav() {
    const dataContext = useContext(DataContext);
    const [menus, setMenus] = useState(MENU_LIST);

    useEffect(() => {
        let updatedMenus  = menus.filter(s => s.text !== 'Tools')
        if (dataContext.environment === Environment.DEVELOPMENT) {
            updatedMenus .push(
                {
                    text: 'Tools',
                    href: "/backend/tools",
                    icon: faTools,
                    submenus: []
                })
        }
        setMenus(updatedMenus );
    }, [dataContext]);

    return (
        <ul className="list-unstyled">
            {menus.map((menu, idx) => (
                <React.Fragment key={idx}>
                    {menu.submenus.length > 0 ? (
                        <SidebarNavGroup key={idx} toggleIcon={menu.icon} toggleText={menu.text}>
                            {menu.submenus.map((subMenu, idxx) => (
                                <SidebarNavItem key={idxx} icon={subMenu.icon} href={subMenu.href}>
                                    <span>{subMenu.text}</span>
                                </SidebarNavItem>
                            ))}
                        </SidebarNavGroup>
                    ) : (
                        <SidebarNavItem key={idx} icon={menu.icon} href={menu.href}>
                           <span> {menu.text}</span>
                        </SidebarNavItem>
                    )}
                </React.Fragment>
            ))}
        </ul>
    )
}
