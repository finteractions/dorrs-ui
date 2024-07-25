import React, {useEffect, useState} from "react"
import {Link} from 'react-scroll';
import Image from "next/image"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faClose} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";

interface Menus {
    text: string,
    to: string,
    icon: string,
    alt: string
}

let MENU_LIST: Array<Menus> = [
    {
        text: 'Name',
        to: "name",
        icon: '/img/pd-ico.svg',
        alt: 'name'
    },
    {
        text: 'Asset Type',
        to: "asset_type",
        icon: '/img/pd-ico.svg',
        alt: 'Asset Type'
    },
    {
        text: 'Total Shares Outstanding',
        to: "total_shares_outstanding",
        icon: '/img/pd-ico.svg',
        alt: 'Total Shares Outstanding'
    },
    {
        text: 'Initial Offering Date',
        to: "initial_offering_date",
        icon: '/img/pd-ico.svg',
        alt: 'Initial Offering Date'
    },
    {
        text: 'Price Per Share',
        to: "price_per_share",
        icon: '/img/pd-ico.svg',
        alt: 'Price Per Shar'
    },
    {
        text: 'Issuer Profile',
        to: "issuer_profile",
        icon: '/img/pd-ico.svg',
        alt: 'Issuer Profile'
    },
    {
        text: 'Company Address',
        to: "company_address",
        icon: '/img/pd-ico.svg',
        alt: 'Company Address'
    },
    {
        text: 'Business Description',
        to: "business_description",
        icon: '/img/pd-ico.svg',
        alt: 'Business Description'
    },
    {
        text: 'Asset Profile Data',
        to: "company_profile_data",
        icon: '/img/pd-ico.svg',
        alt: 'Asset Profile Data'
    },
    {
        text: 'Company Officers & Contacts',
        to: "company_officers_and_contacts",
        icon: '/img/pd-ico.svg',
        alt: 'Company Officers & Contacts'
    },
    {
        text: 'Board of Directors',
        to: "board_of_directors",
        icon: '/img/pd-ico.svg',
        alt: 'Board of Directors'
    },
    {
        text: 'Product & Services',
        to: "product_and_services",
        icon: '/img/pd-ico.svg',
        alt: 'Product & Services'
    },
    {
        text: 'Company Facilities',
        to: "company_facilities",
        icon: '/img/pd-ico.svg',
        alt: 'Company Facilities'
    },
    {
        text: 'Service Providers',
        to: "service_providers",
        icon: '/img/pd-ico.svg',
        alt: 'Service Providers'
    },
    {
        text: 'Financial Reporting',
        to: "financial_reporting",
        icon: '/img/pd-ico.svg',
        alt: 'Financial Reporting'
    },
    {
        text: 'SEC Offering',
        to: "sec_offering",
        icon: '/img/pd-ico.svg',
        alt: 'SEC Offering'
    },
    {
        text: 'SEC Issuer',
        to: "sec_issuer",
        icon: '/img/pd-ico.svg',
        alt: 'SEC Issuer'
    },
    {
        text: 'FINRA CAT',
        to: "finra_cat",
        icon: '/img/pd-ico.svg',
        alt: 'FINRA CAT'
    },
    {
        text: 'Symbols',
        to: "symbols",
        icon: '/img/pd-ico.svg',
        alt: 'Symbols'
    },

]

const CompanyProfileNav = () => {
    const offset = () => -95;
    const [activeMenu, setActiveMenu] = useState<string>("name");
    const [isOpen, setIsOpen] = useState(false);
    const handleClick = (to: string) => {
        setActiveMenu(to);
        toggleMenu()
    }

    const handleScroll = () => {
        const panelBox = document.querySelector('.flex-panel-box.scrollable');

        if (panelBox) {
            const childDivs = Array.from(panelBox.children).filter(child => child.id);

            const currentTopDiv = childDivs.reduce<{ id: string | null, offset: number }>((closest, div) => {
                const box = div.getBoundingClientRect();
                const offset = Math.abs(box.top) + (-95);
                return offset < Math.abs(closest.offset) ? {id: div.id, offset} : closest;
            }, {id: null, offset: Number.POSITIVE_INFINITY}).id;

            if (currentTopDiv && MENU_LIST.map(s => s.to).includes(currentTopDiv)) {
                setActiveMenu(currentTopDiv)
            }
        }
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [])

    const NavItem = ({text, to, icon, alt}: any) => {
        return (
            <Link href={'#'}
                  to={to}
                  smooth={false}
                  duration={500}
                  offset={offset()}
                  onClick={() => handleClick(to)}
                  className={`${to === activeMenu ? 'active' : ''}`}>
                <Image src={icon} width={24} height={24} alt={alt}/>
                {text}
            </Link>
        )
    }

    return (
        <div className="menu">
            <Button
                variant="link"
                className="d-md-none header-menu-btn"
                type="button"
                onClick={toggleMenu}
            >
                {isOpen ? (
                    <FontAwesomeIcon icon={faClose}/>
                ) : (
                    <FontAwesomeIcon icon={faBars}/>
                )}
            </Button>
            <ul className={`${isOpen ? 'open' : ''}`}>
                {MENU_LIST.map((menu, idx) => (
                    <li key={idx}>
                        <NavItem  {...menu} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CompanyProfileNav
