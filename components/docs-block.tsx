import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {IFirm} from "@/interfaces/i-firm";
import {IDoc} from "@/interfaces/i-doc";
import Link from "next/link";
import apiDocService from "@/services/api-docs/api-doc-service";

interface DocsBlockState {
    loading: boolean;
    data: IDoc[];
    errors: string[];
}

class DocsBlock extends React.Component<{}> {
    state: DocsBlockState;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            errors: [],
        }

    }

    componentDidMount() {
        this.setState({loading: true});
        this.getDocs();
    }

    getDocs = () => {
        apiDocService.getDocs()
            .then((res: IDoc[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];

                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">DOCs</div>
                    </div>
                </div>

                <div className="content__bottom d-flex flex-wrap flex-1">
                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.data.length ? (
                                        <>
                                            {this.state.data.map((doc) => {
                                                return (
                                                    <div className={'panel api-block my-2 mx-0 p-2 w-100'}
                                                         key={doc.id}>
                                                        <div className={''}>
                                                            <div className={''}>
                                                                {doc.name}
                                                            </div>
                                                        </div>
                                                        <div className={'content__bottom'}>
                                                            <div
                                                                className={'w-100 mx-1'}>{doc.description}</div>
                                                            <div className={'w-100 mx-1'}>
                                                                <Link className={'b-link'}
                                                                      href={doc.link}
                                                                      target={'_blank'}>
                                                                    {doc.link}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <div className={'panel api-block my-2 mx-0 p-2 w-100'}>
                                                    <NoDataBlock primaryText="No DOCs available yet"/>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </>
        )
    }
}

export default DocsBlock;
