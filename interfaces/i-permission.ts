export interface IPermission {
    key: string;
    name: string;
    permission_id: number;
    values: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}