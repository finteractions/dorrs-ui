import React from 'react';
import AIToolsAssetProfileBlock from "@/components/backend/ai-tools-asset-profile-block";


interface AIToolsBlockState {
    activeTab: string | null;
}

class AIToolsBlock extends React.Component<{}, AIToolsBlockState> {

    constructor(props: {}) {
        super(props);

        this.state = {
            activeTab: null
        }
    }

    componentDidMount() {
        this.setActiveTab('asset-profile');
    }


    setActiveTab = (tab: string) => {
        this.setState({activeTab: tab});
    }

    componentWillUnmount() {

    }


    render() {
        return (

            <div className={'flex-panel-box'}>
                <div className={'panel'}>
                    <div className="content__top">
                        <div className="content__title">AI Tools</div>
                    </div>
                    <ul className="nav nav-tabs" id="tabs">
                        <li className="nav-item">
                            <a className={`nav-link active`}
                               id="home-tab" data-bs-toggle="tab" href="#asset-profile"
                               onClick={() => this.setActiveTab('asset-profile')}>
                                Asset Profile
                            </a>
                        </li>
                    </ul>
                    <div className={'mt-3'}>
                        <div className="tab-content w-100">
                            <div
                                className={`tab-pane fade show active`}
                                id="asset-profile">
                                {this.state.activeTab === 'asset-profile' && (
                                   <AIToolsAssetProfileBlock/>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        )
    }
}

export default AIToolsBlock;
