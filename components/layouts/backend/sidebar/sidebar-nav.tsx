import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    IconDefinition,
} from '@fortawesome/free-regular-svg-icons'
import {
    faChevronUp,
    faUserTie,
    faGauge,
    faWallet,
    faDollarSign,
    faBuilding,
    faBook,
    faFileArchive,
    faHandHoldingUsd, faMoneyBillWave, faUsersRectangle
} from '@fortawesome/free-solid-svg-icons'
import React, {
    PropsWithChildren, useContext, useEffect, useState,
} from 'react'
import {
    Accordion, AccordionContext, Badge, Button, Nav, useAccordionButton,
} from 'react-bootstrap'
import classNames from 'classnames'
import Link from 'next/link'

type SidebarNavItemProps = {
    href: string;
    icon?: IconDefinition;
} & PropsWithChildren

interface Submenu {
    text: string;
    href: string;
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
        text: 'User Management',
        href: '#',
        icon: faUserTie,
        submenus: [
            {
                text: 'Users',
                href: "/backend/user-management",
            },
            {
                text: 'Activity Logs',
                href: "/backend/activity-logs",
            },
            {
                text: 'Blacklist (IP)',
                href: "/backend/blacklist",
            }
        ]
    },
    {
        text: 'Firm Management',
        href: '#',
        icon: faBuilding,
        submenus: [
            {
                text: 'Firms',
                href: "/backend/firm-management",
            }
        ]
    },
    {
        text: 'Form Management',
        href: '#',
        icon: faBook,
        submenus: [
            {
                text: 'Membership Forms',
                href: "/backend/membership-form",
            }
        ]
    },
    {
        text: 'Symbol Management',
        href: '#',
        icon: faDollarSign,
        submenus: [
            {
                text: 'Symbols',
                href: "/backend/asset-management",
            },
            // {
            //     text: 'All Symbols',
            //     href: "/backend/trade-management",
            // }
        ]
    },
    {
        text: 'Last Sale Management',
        href: '#',
        icon: faBook,
        submenus: [
            {
                text: 'Last Sale Reporting',
                href: "/backend/last-sales",
            }
        ]
    },
    {
        text: 'BBO Management',
        href: '#',
        icon: faBook,
        submenus: [
            {
                text: 'Best Bid and Best Offer',
                href: "/backend/best-bid-and-best-offer",
            }
        ]
    },
    // {
    //     text: 'Trade Management',
    //     href: "/backend/trade-management",
    //     icon: faMoneyBillTrendUp,
    //     submenus: []
    // },
    // {
    //     text: 'Custody Management',
    //     href: '#',
    //     icon: faSearchDollar,
    //     submenus: [
    //         {
    //             text: 'Transactions',
    //             href: "/backend/custody-management"
    //         },
    //         {
    //             text: 'Bank Accounts',
    //             href: "/backend/bank-accounts"
    //         },
    //         {
    //             text: 'Fiat Withdrawals',
    //             href: "/backend/fiat-withdrawals"
    //         }
    //     ]
    // },
    {
        text: 'Balances Screen',
        href: "/backend/balances-screen",
        icon: faWallet,
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
        icon: faMoneyBillWave,
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
    // {
    //     text: 'Normal User',
    //     href: "/backend/normal-user",
    //     icon: faUser,
    //     submenus: []
    // }
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
                <Nav.Link className="px-3 py-2 d-flex align-items-center">
                    {icon ? <FontAwesomeIcon className="nav-icon ms-n3" icon={icon}/>
                        : <span className="nav-icon ms-n3"/>}
                    {children}
                </Nav.Link>
            </Link>
        </Nav.Item>
    )
}

const SidebarNavTitle = (props: PropsWithChildren) => {
    const {children} = props

    return (
        <li className="nav-title px-3 py-2 mt-3 text-uppercase fw-bold">{children}</li>
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
    return (
        <ul className="list-unstyled">
            {MENU_LIST.map((menu, idx) => (
                <React.Fragment key={idx}>
                    {menu.submenus.length > 0 ? (
                        <SidebarNavGroup key={idx} toggleIcon={menu.icon} toggleText={menu.text}>
                            {menu.submenus.map((subMenu, idxx) => (
                                <SidebarNavItem key={idxx} href={subMenu.href}>
                                    {subMenu.text}
                                </SidebarNavItem>
                            ))}
                        </SidebarNavGroup>
                    ) : (
                        <SidebarNavItem key={idx} icon={menu.icon} href={menu.href}>
                            {menu.text}
                        </SidebarNavItem>
                    )}
                </React.Fragment>
            ))}
        </ul>
    )
}
