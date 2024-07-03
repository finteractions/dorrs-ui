import React, {useContext, useEffect, useState} from "react";
import {DataContext} from "@/contextes/data-context";

type ProfileContainerProps = {
    children: React.ReactNode
}

export default function AlgorandDataFeedContainer({children}: ProfileContainerProps) {
    const [activeTab, setActiveTab] = useState<string>('last-sale');
    const dataContext = useContext(DataContext);
    const setTab = (tab: string) => {
        setActiveTab(tab);
        dataContext.setSharedData({activeTab: tab});
        window.dispatchEvent(new Event("algorandNavigate"));
    };

    const handleTab = (values: any) => {
        const tab = values.detail.activeTab
        setTab(tab)
    }

    useEffect(() => {
        setTab('last-sale')

        window.addEventListener('handleTab', handleTab);

        return () => {
            window.addEventListener('handleTab', handleTab);
        };
    }, []);


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
                               onClick={() => setTab('last-sale')}>Last
                                Sale</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'best-bid-and-best-offer' ? 'active' : ''}`}
                               id="profile-tab" data-bs-toggle="tab"
                               href="#best-bid-and-best-offer"
                               onClick={() => setTab('best-bid-and-best-offer')}>Best
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
