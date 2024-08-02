import React, {
    PropsWithChildren, useCallback, useEffect, useState,
} from 'react'
import {useResizeDetector} from 'react-resize-detector'
import {Container} from 'react-bootstrap'
import Header from "@/components/layouts/backend/header/header";
import Footer from "@/components/layouts/backend/footer/footer";
import Sidebar, {SidebarOverlay} from "@/components/layouts/backend/sidebar/sidebar";
import layoutWrapper from "@/wrappers/layout-wrapper";


function BackendLayoutWrapper({children}: PropsWithChildren) {
    // Show status for xs screen
    const [isShowSidebar, setIsShowSidebar] = useState(false)

    // Show status for md screen and above
    const [isShowSidebarMd, setIsShowSidebarMd] = useState(true)

    const toggleIsShowSidebar = () => {
        setIsShowSidebar(!isShowSidebar)
    }

    const toggleIsShowSidebarMd = () => {
        const newValue = !isShowSidebarMd
        localStorage.setItem('isShowSidebarMd', newValue ? 'true' : 'false')
        setIsShowSidebarMd(newValue)
    }

    // Clear and reset sidebar
    const resetIsShowSidebar = () => {
        setIsShowSidebar(false)
    }

    const onResize = useCallback(() => {
        resetIsShowSidebar()
    }, [])

    const {ref} = useResizeDetector({onResize})

    // On first time load only
    useEffect(() => {
        if (localStorage.getItem('isShowSidebarMd')) {
            setIsShowSidebarMd(localStorage.getItem('isShowSidebarMd') === 'true')
        }
    }, [setIsShowSidebarMd])

    useEffect(() => {
        const hideSidebar = () => {
            if (window.innerWidth < 1366) {
                setIsShowSidebar(false);
            }
        };

        window.addEventListener('hideSidebar', hideSidebar);

        return () => {
            window.removeEventListener('hideSidebar', hideSidebar);
        };
    }, []);

    return (
        <>
            <div className="backend">
                <div ref={ref} className="position-absolute w-100"/>

                <Sidebar isShow={isShowSidebar} isShowMd={isShowSidebarMd}/>

                <div className="backend wrapper d-flex flex-column min-vh-100">
                    <Header toggleSidebar={toggleIsShowSidebar} toggleSidebarMd={toggleIsShowSidebarMd}/>
                    <div className="body flex-grow-1 px-sm-2 mb-2">
                        <Container fluid="fluid">
                            {children}
                        </Container>
                    </div>
                    <Footer/>
                </div>

                <SidebarOverlay isShowSidebar={isShowSidebar} toggleSidebar={toggleIsShowSidebar}/>
            </div>
        </>
    )
}

export default layoutWrapper(BackendLayoutWrapper);
