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

class DirectoryBlock extends React.Component<DirectoryBlockProps, DirectoryBlockState> {

    state: DirectoryBlockState;
    tableRef: React.RefObject<any> = React.createRef();

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
                logo: row.logo,
                network: row.network,
                description: row.description
            }), {
                id: "name",
                cell: (item) =>
                    <div className="max-width-800 view_block_main_title mb-0">
                        <div className={"company-profile-logo"}>
                            <AssetImage alt=''
                                        src={item.getValue().logo}
                                        width={60}
                                        height={60}/>
                        </div>
                        <div>
                            <div
                                className={`mb-1 table__status show table__status-${item.getValue().status.toLowerCase()}`}>
                                <div>{item.getValue().status.toUpperCase()}</div>
                            </div>
                            <div>
                                {item.getValue().network.length > 0 && (
                                    <div className={'mb-1'}>
                                        <div
                                            className={'tag-block'}>
                                            {item.getValue().network.map((s: string, idx: number) => (
                                                <React.Fragment
                                                    key={idx}>
                                                    <span className={'tag'}>{s}</span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div><h3>{item.getValue().company_name}</h3></div>
                        </div>
                        <div className={'flex-row w-100'}>
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
                        className={'d-flex gap-20 public-directory-col tag-block'}>
                        <div className={'flex-1-1-100'}>
                            <div className={'w-100 content__title'}>Asset
                                Classes
                            </div>
                            <div className={'w-100 content__bottom'}>
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
                        <div className={'flex-1-1-100'}>
                            <div className={'w-100 content__title'}>Asset
                                Regions
                            </div>
                            <div className={'w-100 content__bottom'}>
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
            {key: 'asset_class', placeholder: 'Asset Class'},
            {key: 'asset_region', placeholder: 'Asset Region'},
            {key: 'network', placeholder: 'Network'},
            {key: 'status', placeholder: 'Status'},
        ]
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
                                               className={'no-transponse'}
                                        />
                                    ) : (
                                        <NoDataBlock/>
                                    )}
                                </div>
                            </div>

                        </div>
                        {/*{this.state.data?.length ? (*/}
                        {/*    <>*/}
                        {/*        {this.state.data*/}
                        {/*            .map((item: IDirectoryCompanyProfile, index: number) => (*/}
                        {/*                <React.Fragment key={index}>*/}
                        {/*                    <div className="flex-panel-box public-directory panel mb-4">*/}
                        {/*                        <div*/}
                        {/*                            className="panel d-flex justify-content-between align-items-center">*/}
                        {/*                            <div*/}
                        {/*                                className="content__bottom d-flex justify-content-between w-100">*/}
                        {/*                                <div className="d-flex gap-20 w-100">*/}
                        {/*                                    <div*/}
                        {/*                                        className="blocks w-100 d-flex justify-content-between gap-20">*/}
                        {/*                                        <div className={''}>*/}
                        {/*                                            <div className="view_block_main_title mb-0">*/}
                        {/*                                                <div className={"company-profile-logo"}>*/}
                        {/*                                                    <AssetImage alt=''*/}
                        {/*                                                                src={item.logo}*/}
                        {/*                                                                width={60}*/}
                        {/*                                                                height={60}/>*/}
                        {/*                                                </div>*/}
                        {/*                                                <div>*/}
                        {/*                                                    <div*/}
                        {/*                                                        className={`table__status show table__status-${item.status.toLowerCase()}`}>*/}
                        {/*                                                        {item.status.toUpperCase()}*/}
                        {/*                                                        {item.network.length && (*/}
                        {/*                                                            <>*/}
                        {/*                                                                <div className={'mx-2'}> on*/}
                        {/*                                                                </div>*/}
                        {/*                                                                <div*/}
                        {/*                                                                    className={'tag-block'}>*/}
                        {/*                                                                    {item.network.map((s: string, idx: number) => (*/}
                        {/*                                                                        <React.Fragment*/}
                        {/*                                                                            key={idx}>*/}
                        {/*                                                                    <span*/}
                        {/*                                                                        className={'tag'}>{s}</span>*/}
                        {/*                                                                        </React.Fragment>*/}
                        {/*                                                                    ))}*/}
                        {/*                                                                </div>*/}
                        {/*                                                            </>*/}
                        {/*                                                        )}*/}
                        {/*                                                    </div>*/}
                        {/*                                                    <h3>{item.name}</h3>*/}
                        {/*                                                </div>*/}
                        {/*                                                <div className={'flex-row w-100'}>*/}
                        {/*                                                    <div>*/}
                        {/*                                                        {item.description}*/}
                        {/*                                                    </div>*/}
                        {/*                                                </div>*/}
                        {/*                                            </div>*/}
                        {/*                                        </div>*/}
                        {/*                                        <div*/}
                        {/*                                            className={'d-flex gap-20 public-directory-col tag-block'}>*/}
                        {/*                                            <div className={'flex-1-1-100'}>*/}
                        {/*                                                <div className={'w-100 content__title'}>Asset*/}
                        {/*                                                    Classes*/}
                        {/*                                                </div>*/}
                        {/*                                                <div className={'w-100 content__bottom'}>*/}
                        {/*                                                    {item.asset_class.length ? (*/}
                        {/*                                                        <>*/}
                        {/*                                                            {item.asset_class.map((s: string, idx: number) => (*/}
                        {/*                                                                <React.Fragment key={idx}>*/}
                        {/*                                                                    <span*/}
                        {/*                                                                        className={'tag'}>{s}</span>*/}
                        {/*                                                                </React.Fragment>*/}
                        {/*                                                            ))}*/}
                        {/*                                                        </>*/}
                        {/*                                                    ) : (*/}
                        {/*                                                        <>-</>*/}
                        {/*                                                    )}*/}
                        {/*                                                </div>*/}
                        {/*                                            </div>*/}
                        {/*                                            <div className={'flex-1-1-100'}>*/}
                        {/*                                                <div className={'w-100 content__title'}>Asset*/}
                        {/*                                                    Region*/}
                        {/*                                                </div>*/}
                        {/*                                                <div className={'w-100 content__bottom'}>*/}
                        {/*                                                    {item.asset_region.length ? (*/}
                        {/*                                                        <>*/}
                        {/*                                                            {item.asset_region.map((s: string, idx: number) => (*/}
                        {/*                                                                <React.Fragment key={idx}>*/}
                        {/*                                                                    <span*/}
                        {/*                                                                        className={'tag'}>{s}</span>*/}
                        {/*                                                                </React.Fragment>*/}
                        {/*                                                            ))}*/}
                        {/*                                                        </>*/}
                        {/*                                                    ) : (*/}
                        {/*                                                        <>-</>*/}
                        {/*                                                    )}*/}
                        {/*                                                </div>*/}
                        {/*                                            </div>*/}
                        {/*                                        </div>*/}
                        {/*                                        <div*/}
                        {/*                                            className={'d-flex public-directory-col align-items-center justify-content-center'}>*/}
                        {/*                                            <Link*/}
                        {/*                                                className={'b-btn ripple d-flex align-items-center align-self-center'}*/}
                        {/*                                                target={'_blank'}*/}
                        {/*                                                href={item.website_link}>*/}
                        {/*                                                <span>Website</span>*/}
                        {/*                                            </Link>*/}
                        {/*                                        </div>*/}
                        {/*                                    </div>*/}
                        {/*                                </div>*/}
                        {/*                            </div>*/}
                        {/*                        </div>*/}
                        {/*                    </div>*/}
                        {/*                </React.Fragment>*/}
                        {/*            ))}*/}
                        {/*    </>*/}
                        {/*) : (*/}
                        {/*    <div className={'flex-column'}>*/}
                        {/*        <NoDataBlock/>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </>
                )}
            </>

        );
    }

}

export default DirectoryBlock;
