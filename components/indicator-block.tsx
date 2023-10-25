import React from 'react';
import LoaderBlock from "@/components/loader-block";
import statisticsService from "@/services/statistics/statistics-service";
import {IIndicator} from "@/interfaces/i-indicator";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface IndicatorBlockState extends IState {
    isLoading: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class IndicatorBlock extends React.Component {

    state: IndicatorBlockState;

    getStatisticsInterval!: NodeJS.Timer;

    statisticsSymbol: IIndicator | null;
    statisticsCompanyProfile: IIndicator | null;
    statisticsLastSale: IIndicator | null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
        }

        this.statisticsSymbol = null;
        this.statisticsCompanyProfile = null;
        this.statisticsLastSale = null;
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getMembershipForm();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getStatisticsInterval = setInterval(this.getMembershipForm, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getStatisticsInterval) clearInterval(this.getStatisticsInterval);
    }

    getMembershipForm = () => {
        statisticsService.getIndicators()
            .then((res: Array<IIndicator>) => {

                this.statisticsSymbol = res.find(s => s.type === 'symbol') || null;
                this.statisticsCompanyProfile = res.find(s => s.type === 'company_profile') || null;
                this.statisticsLastSale = res.find(s => s.type === 'last_sale') || null;

            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    getIndicatorType(value: number): any {
        const numericValue = parseFloat(value.toString());

        switch (true) {
            case numericValue > 0:
                return 'up';
            case numericValue < 0:
                return 'down';
            default:
                return '';
        }
    }


    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock width={75} height={75}/>
                ) : (
                    <>
                        <div className="indicators content__bottom">

                            <div className={'indicator__item'}>
                                <div className={''}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>'}}/>
                                    <div>Symbols</div>
                                </div>
                                <div>
                                    <div>{this.statisticsSymbol?.total || '-'}</div>
                                    <div
                                        className={this.statisticsSymbol?.new ? this.getIndicatorType(this.statisticsSymbol.new) : ''}>{this.statisticsSymbol?.new}</div>
                                </div>
                            </div>
                            <div className={'indicator__item'}>
                                <div className={''}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>'}}/>
                                    <div>Company Profile</div>
                                </div>

                                <div>
                                    <div>{this.statisticsCompanyProfile?.total || '-'}</div>
                                    <div
                                        className={this.statisticsCompanyProfile?.new ? this.getIndicatorType(this.statisticsCompanyProfile.new) : ''}>{this.statisticsCompanyProfile?.new}</div>
                                </div>
                            </div>
                            <div className={'indicator__item'}>
                                <div className={''}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.3" x="13" y="4" width="3" height="16" rx="1.5" fill="#718494"/><rect x="8" y="9" width="3" height="11" rx="1.5" fill="#718494"/><rect x="18" y="11" width="3" height="9" rx="1.5" fill="#718494"/><rect x="3" y="13" width="3" height="7" rx="1.5" fill="#718494"/></svg>'}}/>
                                    <div>Last Sale</div>
                                </div>
                                <div>
                                    <div>{this.statisticsLastSale?.total || '-'}</div>
                                    <div
                                        className={this.statisticsLastSale?.new ? this.getIndicatorType(this.statisticsLastSale.new) : ''}>{this.statisticsLastSale?.new}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default IndicatorBlock;
