import React, {useContext, useEffect, useState} from "react"
import Link from "next/link";
import Image from "next/image"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faBars, faClose} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import {DataContext} from "@/contextes/data-context";
import {ISocialMediaLink, socialMediaLinks} from "@/interfaces/i-social-media-link";
import LoaderBlock from "@/components/loader-block";

const DataFeedProviderNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const context = useContext(DataContext);
    const [dataFeedProvider, setDataFeedProvider] = useState<IDataFeedProvider | null>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };


    useEffect(() => {
        if (context && context.getSharedData()) {
            const dataFeedProvider = context.getSharedData();

            let socialLinks = [...socialMediaLinks];
            const socials = JSON.parse(dataFeedProvider?.social_media_link || '{}')

            Object.keys(socials).forEach((soc: any) => {
                let social = socialLinks.find(s => s.key === soc)
                if (social) {
                    social.link = socials[soc];
                }
            })
            dataFeedProvider.socials = socialLinks;
            setDataFeedProvider(dataFeedProvider)
            setLoading(false)
        }

    }, [context])

    return (
        <>
            {loading ? (
                <LoaderBlock/>
            ) : (
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
                        {dataFeedProvider?.website_link && (
                            <li>
                                <Link className={'link info-panel-title-link block-link'}
                                      href={dataFeedProvider.website_link}
                                      target={'_blank'}>
                                    <div className={''}>
                                        <Image src={'/img/pd-ico.svg'} width={24} height={24} alt={''}/> Website
                                        <FontAwesomeIcon className="nav-icon"
                                                         icon={faArrowUpRightFromSquare}/>

                                    </div>
                                </Link>
                            </li>
                        )}

                        {dataFeedProvider?.fees_link && (
                            <li>
                                <Link className={'link info-panel-title-link block-link'}
                                      href={dataFeedProvider.fees_link}
                                      target={'_blank'}>
                                    <div className={''}>
                                        <Image src={'/img/pd-ico.svg'} width={24} height={24} alt={''}/> Fees

                                        <FontAwesomeIcon className="nav-icon"
                                                         icon={faArrowUpRightFromSquare}/>

                                    </div>
                                </Link>
                            </li>
                        )}

                        {dataFeedProvider?.socials && (dataFeedProvider?.socials as any).map((social: ISocialMediaLink) => (
                            <>
                                {social.link && (
                                    <li key={social.key}>
                                        <Link className={'link info-panel-title-link block-link'}
                                              href={social.link}
                                              target={'_blank'}>
                                            <div className={''}>
                                                <div className={'icon-block-show'}
                                                     dangerouslySetInnerHTML={{__html: social?.icon || ''}}/>
                                                {social.name} {' '}

                                                <FontAwesomeIcon className="nav-icon"
                                                                 icon={faArrowUpRightFromSquare}/>

                                            </div>
                                        </Link>
                                    </li>
                                )}

                            </>
                        ))}

                    </ul>
                </div>
            )}
        </>
    );
};

export default DataFeedProviderNav
