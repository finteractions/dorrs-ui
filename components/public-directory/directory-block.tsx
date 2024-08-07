import React from 'react';
import AssetImage from "@/components/asset-image";
import Link from "next/link";
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import publicDirectoryService from "@/services/public-directory/public-directory-service";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faList, faPlus, faSortAmountAsc, faSquare, faThLarge} from "@fortawesome/free-solid-svg-icons";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";

interface DirectoryBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: Array<IDirectoryCompanyProfile> | null;
    isToggle: boolean;
}

class DirectoryBlock extends React.Component<{}, DirectoryBlockState> {

    state: DirectoryBlockState;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: null,
            isToggle: false
        }
    }


    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getCompanyProfile();
        });
    }

    componentWillUnmount() {

    }

    getCompanyProfile = () => {
        publicDirectoryService.getCompanyProfile()
            .then((res: Array<IDirectoryCompanyProfile>) => {
                const data = res || [];
                
                this.handleData(data);
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleData = (data: Array<IDirectoryCompanyProfile>) => {
        this.setState({data: data ?? null})
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className={'flex-panel-box mb-4'}>
                            <div className="panel">
                                <div className="content__top">
                                    <div className="content__title">Directory</div>
                                    <div className="content__title_btns content__filter download-buttons justify-content-end">

                                        <Link
                                            className={'d-none d-md-flex b-btn ripple d-flex align-items-center align-self-center'}
                                            href={'public-directory/add'}>
                                            <span>List Your Company</span>
                                        </Link>

                                        <Link
                                            className={'d-md-none admin-table-btn ripple'}
                                            href={'public-directory/add'}>
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </Link>

                                    </div>
                                </div>
                            </div>
                        </div>


                        {this.state.data?.length ? (
                            <>
                                {this.state.data
                                    .map((item: IDirectoryCompanyProfile, index: number) => (
                                        <React.Fragment key={index}>
                                            <div className="flex-panel-box public-directory panel mb-4">
                                                <div
                                                    className="panel d-flex justify-content-between align-items-center">
                                                    <div
                                                        className="content__bottom d-flex justify-content-between w-100">
                                                        <div className="d-flex gap-20 w-100">
                                                            <div
                                                                className="blocks w-100 d-flex justify-content-between gap-20">
                                                                <div className={''}>
                                                                    <div className="view_block_main_title mb-0">
                                                                        <div className={"company-profile-logo"}>
                                                                            <AssetImage alt=''
                                                                                        src={item.logo}
                                                                                        width={60}
                                                                                        height={60}/>
                                                                        </div>
                                                                        <div>
                                                                            <div
                                                                                className={`table__status show table__status-${item.status.toLowerCase()}`}>
                                                                                {item.status.toUpperCase()}
                                                                                {item.network.length && (
                                                                                    <>
                                                                                        <div className={'mx-2'}> on </div>
                                                                                        <div
                                                                                            className={'tag-block'}>
                                                                                            {item.network.map((s: string, idx: number) => (
                                                                                                <React.Fragment
                                                                                                    key={idx}>
                                                                                            <span
                                                                                                className={'tag'}>{s}</span>
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                            <h3>{item.name}</h3>
                                                                        </div>
                                                                        <div className={'flex-row w-100'}>
                                                                            <div>
                                                                                {item.description}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={'d-flex gap-20 public-directory-col tag-block'}>
                                                                    <div className={'flex-1-1-100'}>
                                                                        <div className={'w-100 content__title'}>Asset
                                                                            Classes
                                                                        </div>
                                                                        <div className={'w-100 content__bottom'}>
                                                                            {item.asset_class.length ? (
                                                                                <>
                                                                                    {item.asset_class.map((s: string, idx: number) => (
                                                                                        <React.Fragment key={idx}>
                                                                                            <span
                                                                                                className={'tag'}>{s}</span>
                                                                                        </React.Fragment>
                                                                                    ))}
                                                                                </>
                                                                            ) : (
                                                                                <>-</>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className={'flex-1-1-100'}>
                                                                        <div className={'w-100 content__title'}>Asset
                                                                            Region
                                                                        </div>
                                                                        <div className={'w-100 content__bottom'}>
                                                                            {item.asset_region.length ? (
                                                                                <>
                                                                                    {item.asset_region.map((s: string, idx: number) => (
                                                                                        <React.Fragment key={idx}>
                                                                                            <span
                                                                                                className={'tag'}>{s}</span>
                                                                                        </React.Fragment>
                                                                                    ))}
                                                                                </>
                                                                            ) : (
                                                                                <>-</>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={'d-flex public-directory-col align-items-center justify-content-center'}>
                                                                    <Link
                                                                        className={'b-btn ripple d-flex align-items-center align-self-center'}
                                                                        target={'_blank'}
                                                                        href={item.website_link}>
                                                                        <span>Website</span>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                            </>
                        ) : (
                            <div className={'flex-column'}>
                                <NoDataBlock/>
                            </div>
                        )}
                    </>
                )}
            </>

        );
    }

}

export default DirectoryBlock;
