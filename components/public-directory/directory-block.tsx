import React from 'react';
import AssetImage from "@/components/asset-image";
import Link from "next/link";
import publicDirectoryService from "@/services/public-directory/public-directory-service";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEarth, faFilter, faPlus} from "@fortawesome/free-solid-svg-icons";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";
import {Button} from "react-bootstrap";
import {FormStatus, getPublicDirectoryFormStatusNames} from "@/enums/form-status";

interface DirectoryBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: Array<IDirectoryCompanyProfile> | null;
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
    rowProps: ITableRowProps;
}

interface DirectoryBlockProps extends ICallback {

}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class DirectoryBlock extends React.Component<DirectoryBlockProps, DirectoryBlockState> {

    state: DirectoryBlockState;
    tableRef: React.RefObject<any> = React.createRef();
    getProfileInterval: NodeJS.Timer | number | undefined;

    customBtns: Array<ICustomButtonProps> = [
        {
            icon: <FontAwesomeIcon className="nav-icon" icon={faEarth}/>,
            onCallback: 'navigate'
        }
    ]

    constructor(props: DirectoryBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: null,
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex',
            rowProps: {className: ''}
        }

        columns = [
            columnHelper.accessor((row) => ({
                company_name: row.company_name,
                status: row.status,
                profile_status: row.profile_status,
                logo: row.logo,
                network: row.network,
                description: row.description
            }), {
                id: "name",
                cell: (item) =>
                    <div className="d-block view_block_main_title mb-0">
                        <div className={'d-flex gap-20 align-items-center'}>
                            <div className={"company-profile-logo"}>
                                <AssetImage alt=''
                                            src={item.getValue().logo}
                                            width={60}
                                            height={60}/>
                            </div>
                            <div>
                                <div
                                    className={`mb-1 show table__status-${(item.getValue().status).toLowerCase()}`}>
                                    <div className={'d-flex flex-shrink-0 align-items-center'}>
                                        <span
                                            className={`flex-shrink-0 font-weight-500 color-${(item.getValue().status).toLowerCase()}`}>
                                            {getPublicDirectoryFormStatusNames(item.getValue().status).toUpperCase()}
                                        </span>
                                        {item.getValue().network.length > 0 && item.getValue().status === FormStatus.APPROVED && (
                                            <>
                                                <span className={'flex-shrink-0 margin-left-10'}> on</span>
                                                <div
                                                    className={'tag-block align-items-center'}>
                                                    {item.getValue().network.map((s: string, idx: number) => (
                                                        <React.Fragment
                                                            key={idx}>
                                                            <span className={'tag'}>{s}</span>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>


                                </div>
                                <div className={'d-flex align-items-center'}>
                                    <h3 className={'mb-0'}>{item.getValue().company_name}</h3>
                                    <div
                                        className={`margin-left-10 table__status show table__status-${(item.getValue().profile_status).toString().replace(/ /g, '').toLowerCase()}`}>
                                        <div className={'d-flex flex-shrink-0 align-items-center'}>
                                            {item.getValue().profile_status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'flex-row w-100 mt-3'}>
                            <div>
                                {item.getValue().description}
                            </div>
                        </div>
                    </div>

                ,
                header: () => <span></span>,
            }),
            columnHelper.accessor((row) => ({
                asset_class: row.asset_class,
                asset_region: row.asset_region,
            }), {
                id: "asset_class_region",
                cell: (item) =>
                    <div
                        className={'d-flex gap-20 public-directory-col'}>
                        <div className={'flex-1-1-100 px-1'}>
                            <div className={'w-100 content__title'}>Asset
                                Classes
                            </div>
                            <div className={'w-100 content__bottom tag-block mx-0'}>
                                {item.getValue().asset_class.length > 0 ? (
                                    <>
                                        {item.getValue().asset_class.map((s: string, idx: number) => (
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
                        <div className={'flex-1-1-100 px-1'}>
                            <div className={'w-100 content__title'}>Asset
                                Regions
                            </div>
                            <div className={'w-100 content__bottom tag-block mx-0'}>
                                {item.getValue().asset_region.length > 0 ? (
                                    <>
                                        {item.getValue().asset_region.map((s: string, idx: number) => (
                                            <React.Fragment key={idx}>
                                                <span className={'tag'}>{s}</span>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <>-</>
                                )}
                            </div>
                        </div>
                    </div>
                ,
                header: () => <span></span>,
            }),
        ];

        tableFilters = [
            {key: 'asset_class', placeholder: 'Asset Classes', type: 'multiSelect'},
            {key: 'asset_region', placeholder: 'Asset Regions', type: 'multiSelect'},
            {key: 'network', placeholder: 'Live Protocols', type: 'multiSelect'},
            {key: 'profile_status', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getFirmProfile();
        });
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate(): void {
        this.getProfileInterval = setInterval(this.getFirmProfile, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getProfileInterval) clearInterval(this.getProfileInterval as number);
    }

    getFirmProfile = () => {
        publicDirectoryService.getCompanyProfile()
            .then((res: Array<IDirectoryCompanyProfile>) => {
                let data = res || [];
                data.forEach((s:IDirectoryCompanyProfile) => {
                    s.isDisabled = s.website_link === '';
                });
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

    navigate = (data: IDirectoryCompanyProfile) => {
        this.props.onCallback(data.website_link)
    }

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className={'flex-panel-box mb-4 public-directory'}>
                            <div className="panel">
                                <div className="content__top">
                                    <div className="content__title">Directory</div>
                                    <div
                                        className="content__title_btns content__filter download-buttons justify-content-end">

                                        <Link
                                            className={'d-none d-md-flex b-btn ripple d-flex align-items-center align-self-center'}
                                            href={'public-directory/add'}>
                                            <span>List Your Company</span>
                                        </Link>
                                        <Button
                                            variant="link"
                                            className="d-md-none admin-table-btn ripple"
                                            type="button"
                                            onClick={() => this.handleShowFilters()}
                                        >
                                            <FontAwesomeIcon icon={faFilter}/>
                                        </Button>
                                        <Link
                                            className={'d-md-none admin-table-btn ripple'}
                                            href={'public-directory/add'}>
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </Link>

                                    </div>
                                </div>

                                <div className={'content__bottom flex-table'}>
                                    {this.state.data?.length ? (
                                        <Table columns={columns}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               filters={tableFilters}
                                               ref={this.tableRef}
                                               header={false}
                                               customBtnProps={this.customBtns}
                                               filtersClassName={this.state.filtersClassName}
                                               rowProps={this.state.rowProps}
                                               className={`no-transponse`}
                                        />
                                    ) : (
                                        <NoDataBlock/>
                                    )}
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </>

        );
    }

}

export default DirectoryBlock;
