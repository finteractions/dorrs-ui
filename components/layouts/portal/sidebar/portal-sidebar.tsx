// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
// import {faAngleLeft} from '@fortawesome/free-solid-svg-icons'
import React, {useEffect, useState} from 'react'
import classNames from 'classnames'

import PortalSidebarNav from "@/components/layouts/portal/sidebar/portal-sidebar-nav";

import PortalLogo from "@/components/layouts/portal/portal-logo";
import Image from "next/image";


export default function PortalSidebar(props: { isShow: boolean; isShowMd: boolean, toggleIsShowSidebarMd: () => void }) {
    const {isShow, isShowMd} = props

    return (
        <div
            className={classNames('sidebar d-flex flex-column position-fixed h-100', {
                // 'sidebar-narrow': isNarrow,
                show: isShow,
                // 'md-hide': !isShowMd,
                'short-sidebar': !isShowMd,
            })}
        >
            <div className="sidebar-brand d-flex align-items-center justify-content-center">
                {isShowMd ? (
                    <PortalLogo/>
                ) : (
                    <span className={'b-logo'}>
                        <Image src="/img/logo-small.png" width={34.25} height={40} alt="Logo" priority/>
                    </span>
                )}

                <div className={"sidebar-top-arrow"}  onClick={props.toggleIsShowSidebarMd}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.7071 6.70711C13.0976 6.31658 13.0976 5.68342 12.7071 5.29289C12.3166 4.90237 11.6834 4.90237 11.2929 5.29289L5.29289 11.2929C4.91431 11.6715 4.90107 12.2811 5.26285 12.6757L10.7628 18.6757C11.136 19.0828 11.7686 19.1103 12.1757 18.7372C12.5828 18.364 12.6103 17.7314 12.2372 17.3243L7.38414 12.0301L12.7071 6.70711Z" fill="#718494"/>
                        <path opacity="0.3" d="M19.7071 6.70711C20.0976 6.31658 20.0976 5.68342 19.7071 5.29289C19.3166 4.90237 18.6834 4.90237 18.2929 5.29289L12.2929 11.2929C11.9143 11.6715 11.9011 12.2811 12.2628 12.6757L17.7628 18.6757C18.136 19.0828 18.7686 19.1103 19.1757 18.7372C19.5828 18.364 19.6103 17.7314 19.2372 17.3243L14.3841 12.0301L19.7071 6.70711Z" fill="#718494"/>
                    </svg>

                </div>
            </div>

            <div className="sidebar-nav flex-fill">
                <PortalSidebarNav/>
            </div>
        </div>
    )
}

export const SidebarOverlay = (props: { isShowSidebar: boolean; toggleSidebar: () => void }) => {
    const {isShowSidebar, toggleSidebar} = props

    return (
        <div
            tabIndex={-1}
            aria-hidden
            className={classNames('sidebar-overlay position-fixed top-0 bg-dark w-100 h-100 opacity-50', {
                'd-none': !isShowSidebar,
            })}
            onClick={toggleSidebar}
        />
    )
}
