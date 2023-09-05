import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {ICustody} from "@/interfaces/i-custody";
import {IBalance} from "@/interfaces/i-balance";
import {IActivityLog} from "@/interfaces/i-activity-log";
import {IUserDetail} from "@/interfaces/i-user-detail";
import {IUser} from "@/interfaces/i-user";
import {IBlacklist} from "@/interfaces/i-blacklist";
import {any} from "prop-types";

class AdminService extends BaseService {

    private PATH = 'portal/';

    queryLimit = process.env.QUERY_LIMIT || '1000';

    constructor() {
        super();
    }

    public login(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}admin_login/`, data);
    }

    public async getUsers(): Promise<IUserDetail[]> {
        return (await apiWebBackendService.get<IResponse<IUserDetail[]>>(`${this.PATH}client_approval/?limit=${this.queryLimit}`, {}, this.getAdminToken())).data;
    }

    public async getUserById(id: number): Promise<IUser> {
        return (await apiWebBackendService.get<IUser>(`${this.PATH}users/${id}/`, {}, this.getAdminToken()));
    }

    public async getUser(user_id: string): Promise<IUserDetail[]> {
        return (await apiWebBackendService.get<IResponse<IUserDetail[]>>(`${this.PATH}client_approval/?user_id=${encodeURIComponent(user_id)}`, {}, this.getAdminToken())).data;
    }


    public async approveUser(user_id: string, is_approved: boolean, comment: string): Promise<IResponseApi> {
        const data = {
            user_id: user_id,
            is_approved: is_approved,
            comment: comment
        }

        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}client_approval/`, data, {}, this.getAdminToken()));
    }

    public async activateUser(user_id: string, active: boolean): Promise<IResponseApi> {
        const data: any = {
            user_email: user_id,
            is_block: !active,
            comment: ''
        }
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}block_user/`, data, {}, this.getAdminToken()));
    }

    public async getCustodians(): Promise<ICustody[]> {
        return (await apiWebBackendService.get<IResponse<ICustody[]>>(`${this.PATH}custody_management/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async getBalances(): Promise<IBalance[]> {
        return (await apiWebBackendService.get<IResponse<IBalance[]>>(`${this.PATH}client_balances/?limit=${this.queryLimit}`, {}, this.getAdminToken())).data;
    }

    public async getUserBalances(user_id: string): Promise<IBalance[]> {
        const data: any = {
            user_id: user_id
        }
        const params: any = {
            limit: this.queryLimit
        }
        return (await apiWebBackendService.post<IResponse<IBalance[]>>(`${this.PATH}client_balances/`, data, params, this.getAdminToken())).data;
    }

    public async getBlacklist(): Promise<IBlacklist[]> {
        const params: any = {
            limit: this.queryLimit
        }

        return (await apiWebBackendService.get<IResponse<IBlacklist[]>>(`${this.PATH}block_user_ip/`, params, this.getAdminToken())).data;
    }

    public async updateBlacklistStatus(ip_address: string, is_block: boolean, user_email: string, comment: string = ''): Promise<IResponseApi> {
        const data: any = {
            ip_address: ip_address,
            is_block: is_block,
            comment: comment,
            user_email: user_email
        }
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}block_user_ip/`, data, {}, this.getAdminToken()));
    }

    public async getBankAccounts(): Promise<IAdminBankAccount[]> {
        return (await apiWebBackendService.get<IResponse<IAdminBankAccount[]>>(`${this.PATH}users_bank_account/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async getBankAccount(id: number): Promise<IAdminBankAccount> {
        return (await apiWebBackendService.get<IAdminBankAccount>(`${this.PATH}users_bank_account/${id}/`, {}, this.getAdminToken()));
    }

    public async getFiatWithdrawals(): Promise<ICustody[]> {
        return (await apiWebBackendService.get<IResponse<ICustody[]>>(`${this.PATH}fiat_withdrawals/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async getFiatWithdrawal(id: number): Promise<ICustody> {
        return (await apiWebBackendService.get<ICustody>(`${this.PATH}fiat_withdrawals/${id}/`, {}, this.getAdminToken()));
    }

    public async getTransaction(id: number): Promise<ICustody> {
        return (await apiWebBackendService.get<ICustody>(`${this.PATH}custody_management/${id}/`, {}, this.getAdminToken()));
    }

    public async updateFiatTransactionStatus(id: number, is_approved: boolean, comment: string): Promise<IResponseApi> {
        const data = {
            txn_id: id,
            status: is_approved ? 'Approved' : 'Rejected',
            comment: comment
        }
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}fiat_change_status/`, data, {}, this.getAdminToken()));
    }

    public async getAssets(): Promise<IAdminAsset[]> {
        return (await apiWebBackendService.get<IResponse<IAdminAsset[]>>(`${this.PATH}asset_management/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async getAsset(label: string): Promise<IAdminAsset[]> {
        const params: any = {
            label: label
        }
        return (await apiWebBackendService.get<IResponse<IAdminAsset[]>>(`${this.PATH}asset_management/`, params, this.getAdminToken())).results;
    }

    public async getActivityLogs(): Promise<IActivityLog[]> {
        return (await apiWebBackendService.get<IResponse<IActivityLog[]>>(`${this.PATH}user_activity/?offset=0&limit=${this.queryLimit}`, {}, this.getAdminToken())).data;
    }

    public async getUserActivityLogs(user_id: string): Promise<IActivityLog[]> {
        return (await apiWebBackendService.get<IResponse<IActivityLog[]>>(`${this.PATH}user_activity/?offset=0&limit=${this.queryLimit}&user_id=${encodeURIComponent(user_id)}`, {}, this.getAdminToken())).data;
    }

    public async deleteAsset(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}asset_management/${id}/`, {}, {}, this.getAdminToken());
    }

    public async updateAsset(data: any, id: number): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}asset_management/${id}/`, data, {}, this.getAdminToken());
    }

    public async createAsset(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}asset_management/`, data, {}, this.getAdminToken()));
    }

    public async updateAssetStatus(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}trade_management/`, data, {}, this.getAdminToken()));
    }

    public async deleteBankAccount(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}users_bank_account/${id}/`, {}, {}, this.getAdminToken());
    }

    public async updateBankAccount(data: any, id: number): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}users_bank_account/${id}/`, data, {}, this.getAdminToken());
    }

    public async approveBankAccount(id: number, is_approved: boolean, comment: string): Promise<IResponseApi> {
        const data = {
            id: id,
            status: is_approved ? 'approved' : 'rejected',
            comment: comment
        }
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}users_bank_account/`, data, {}, this.getAdminToken()));
    }

    public async downloadBalances(data: any): Promise<string> {
        return (await apiWebBackendService.post<string>(`${this.PATH}balances_csv/`, data, {}, this.getAdminToken()));
    }

    public async updateBalance(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}fiat_balance_update/`, data, {}, this.getAdminToken()));
    }

    public async sendFinanceReport(): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}withdraw_report/`, {}, {}, this.getAdminToken()));
    }

    public async getUserMembershipForms(): Promise<Array<IMembershipForm>> {
        return (await apiWebBackendService.get<IResponse<IMembershipForm[]>>(`${this.PATH}users_membership_form/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async approveMembershipForm(id: number, is_approved: boolean, comment: string): Promise<IResponseApi> {
        const data = {
            status: is_approved ? 'approved' : 'rejected',
            comment: comment
        }

        return (await apiWebBackendService.put<IResponseApi>(`${this.PATH}users_membership_form/${id}/`, data, {}, this.getAdminToken()));
    }

}

const adminService = new AdminService();

export default adminService;
