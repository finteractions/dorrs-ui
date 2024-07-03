import React, {useContext, useEffect, useState} from "react";
import {DataContext} from "@/contextes/data-context";
import {useRouter} from "next/router";

type ProfileContainerProps = {
    children: React.ReactNode
}

export default function AlgorandDataFeedContainer({children}: ProfileContainerProps) {
    const [activeTab, setActiveTab] = useState<string>('last-sale');
    const dataContext = useContext(DataContext);
    const router = useRouter();

    const setTab = (tab: string) => {
        setActiveTab(tab);
        dataContext.setSharedData({activeTab: tab});
    };

    const handleTab = (values: any) => {
        const tab = values.detail.activeTab
        setTab(tab)
    }

    const handleBack = (tab: string) => {
        setTab(tab);
        window.dispatchEvent(new Event("algorandNavigate"));
    }

    useEffect(() => {
        setTab('last-sale')

        window.addEventListener('handleTab', handleTab);

        return () => {
            window.addEventListener('handleTab', handleTab);
        };
    }, []);

    useEffect(() => {
        console.log("Current path:", router.pathname);
        const pathes = router.pathname.split('/')
        console.log(pathes)
        if(pathes[2]){
            setTab(pathes[2])
        }
        // You can add more logic here based on the current path
    }, [router.pathname]);


    return (
        <div className={'flex-panel-box '}>

            <div className={'panel'}>
                <div className={'content__top'}>
                    <div className={'content__title'}>Algorand Data Feed</div>
                </div>
            </div>
            <div className={'panel'}>
                <div className={'content__bottom'}>
                    <ul className="nav nav-tabs" id="tabs">
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'last-sale' ? 'active' : ''}`}
                               id="home-tab" data-bs-toggle="tab" href="#last-sale"
                               onClick={() => handleBack('last-sale')}>Last
                                Sale</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'best-bid-and-best-offer' ? 'active' : ''}`}
                               id="profile-tab" data-bs-toggle="tab"
                               href="#best-bid-and-best-offer"
                               onClick={() => handleBack('best-bid-and-best-offer')}>Best
                                Bid And Best Offer</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="tab-content w-100">
                {children}
            </div>


        </div>
    )
}
