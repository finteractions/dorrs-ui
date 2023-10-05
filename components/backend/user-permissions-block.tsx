import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {IPermission} from "@/interfaces/i-permission";

interface UserPermissionsBlockState {
    loading: boolean;
    settingCheckbox: {
        view: boolean;
        edit: boolean;
        create: boolean;
        delete: boolean;
    };
    data: IPermission[];
    errors: string[];

}

interface UserPermissionsBlockProps {
    user_id: string
}

class UserPermissionsBlock extends React.Component<UserPermissionsBlockProps, UserPermissionsBlockState> {
    state: UserPermissionsBlockState;

    constructor(props: UserPermissionsBlockProps) {
        super(props);

        this.state = {
            loading: true,
            settingCheckbox: {
                view: false,
                edit: false,
                create: false,
                delete: false
            },
            data: [],
            errors: [],
        }
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getUserPermissions();
    }

    getUserPermissions = () => {

        adminService.getUserPermissions(this.props.user_id)
            .then((res: IPermission[]) => {
                this.setState({data: res});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    setUserPermissions = (permission: string, type: string, value: boolean) => {
        let editValue = value && (type === 'create' || type === 'delete');
        let viewValue = value && (type === 'create' || type === 'delete');

        this.setState(prevState => ({
            settingCheckbox: {
                ...prevState.settingCheckbox,
                [type]: true,
            },
        }));

        const data = {
            user_id: this.props.user_id,
            permission: permission,
            create: editValue,
            edit: editValue,
            view: viewValue,
            [type]: value
        }

        adminService.setUserPermissions(data)
            .then()
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState(prevState => ({
                    settingCheckbox: {
                        ...prevState.settingCheckbox,
                        [type]: false,
                    },
                }));
                this.getUserPermissions();
            });
    }

    render() {
        return (

            <>
                <div className="info-panel-section-title mb-2">
                    <div className='info-panel-title-text'>Permissions</div>
                </div>

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
                                        <div className="table mb-3">
                                            <div className="overflow-x-auto">
                                                <table>
                                                    <thead>
                                                    <tr>
                                                        <th className="head_permission_name">Name</th>
                                                        <th className="head_permission_rule">View</th>
                                                        <th className="head_permission_rule">Create</th>
                                                        <th className="head_permission_rule">Delete</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {this.state.data.map((item) => (
                                                        <tr key={item.key}>
                                                            <td>
                                                                <div className="permission_name">
                                                                    {item.name}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="permission_rule">
                                                                    <input disabled={this.state.settingCheckbox.view}
                                                                           type="checkbox"
                                                                           onChange={(event) => this.setUserPermissions(item.key, 'view', event.target.checked)}
                                                                           checked={item.values.view}/>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="permission_rule">
                                                                    <input disabled={this.state.settingCheckbox.create}
                                                                           type="checkbox"
                                                                           onChange={(event) => this.setUserPermissions(item.key, 'create', event.target.checked)}
                                                                           checked={item.values.create}/>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="permission_rule">
                                                                    <input disabled={this.state.settingCheckbox.delete}
                                                                           type="checkbox"
                                                                           onChange={(event) => this.setUserPermissions(item.key, 'delete', event.target.checked)}
                                                                           checked={item.values.delete}/>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {this.state.errors.length ? (
                                            <AlertBlock type="error" messages={this.state.errors}/>
                                        ) : (
                                            <NoDataBlock primaryText="No Permissions available yet"/>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </>
        )
    }
}

export default UserPermissionsBlock;
