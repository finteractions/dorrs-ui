import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {ICustody} from "@/interfaces/i-custody";
import {IBalance} from "@/interfaces/i-balance";
import {IActivityLog} from "@/interfaces/i-activity-log";
import {IUserDetail} from "@/interfaces/i-user-detail";
import {IUser} from "@/interfaces/i-user";
import {IBlacklist} from "@/interfaces/i-blacklist";
import {ISymbol} from "@/interfaces/i-symbol";
import {IPermission} from "@/interfaces/i-permission";
import {IFirm} from "@/interfaces/i-firm";
import {ILastSale} from "@/interfaces/i-last-sale";
import {IDoc} from "@/interfaces/i-doc";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import {IFees} from "@/interfaces/i-fees";
import {IInvoice} from "@/interfaces/i-invoice";
import {IBank} from "@/interfaces/i-bank";
import {IChartStatistics} from "@/interfaces/i-chart-statistics";
import {IMemberDistribution} from "@/interfaces/i-member-distribution";
import {IMemberDistributionHistory} from "@/interfaces/i-member-distribution-history";
import {IOrder} from "@/interfaces/i-order";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

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

    public addUser(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}users/`, data, {}, this.getAdminToken())
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

    public async getAssets(symbol?: string | null, linked = false): Promise<ISymbol[]> {
        let queryString = "";
        if (symbol) {
            queryString += `&symbol=${symbol}`;
        }
        if (linked) {
            queryString += `&linked=true`;
        }

        return (await apiWebBackendService.get<IResponse<ISymbol[]>>(`${this.PATH}asset_management/?limit=${this.queryLimit}${queryString}`, {}, this.getAdminToken())).results;
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

    public async approveAsset(id: number, is_approved: boolean): Promise<IResponseApi> {
        const data = {
            status: is_approved ? 'approved' : 'rejected',
            is_approval: true
        }

        return (await apiWebBackendService.put<IResponseApi>(`${this.PATH}asset_management/${id}/`, data, {}, this.getAdminToken()));
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

    public async getUserMembershipForms(): Promise<Array<IMembership>> {
        return (await apiWebBackendService.get<IResponse<IMembership[]>>(`${this.PATH}users_membership_form/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async approveMembershipForm(id: number, is_approved: boolean, comment: string): Promise<IResponseApi> {
        const data = {
            status: is_approved ? 'approved' : 'rejected',
            comment: comment
        }

        return (await apiWebBackendService.put<IResponseApi>(`${this.PATH}users_membership_form/${id}/`, data, {}, this.getAdminToken()));
    }

    public async getUserPermissions(user_id: string): Promise<IPermission[]> {
        return (await apiWebBackendService.get<IResponse<IPermission[]>>(`${this.PATH}access_management/?user_id=${encodeURIComponent(user_id)}`, {}, this.getAdminToken())).data;
    }

    public async setUserPermissions(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}access_management/`, data, {}, this.getAdminToken()));
    }

    public async createCompanyProfile(data: any, isPending=false): Promise<IResponseApi> {
        const query = isPending ? '?pending=true' : '';
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}company_profile/${query}`, data, {}, this.getAdminToken()));
    }

    public async updateCompanyProfile(data: any, id: number, isPending=false): Promise<IResponseApi> {
        const query = isPending ? '?pending=true' : '';
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}company_profile/${id}/${query}`, data, {}, this.getAdminToken());
    }

    public async approveCompanyProfile(id: number, is_approved: boolean, isPending=false): Promise<IResponseApi> {
        const data = {
            id: id,
            status: is_approved ? 'approved' : 'rejected',
        }
        const query = isPending ? '?pending=true' : '';
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}approve_company_profile/${query}`, data, {}, this.getAdminToken()));
    }

    public async createCompany(name: string): Promise<IResponseApi> {
        const data = {
            name: name
        }
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}firm_management/`, data, {}, this.getAdminToken()));
    }

    public async assignCompany(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}assign_firm/`, data, {}, this.getAdminToken()));
    }

    public async getFirms(): Promise<IFirm[]> {
        return (await apiWebBackendService.get<IResponse<IFirm[]>>(`${this.PATH}firm_management/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async createFirm(data: any): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}firm_management/`, data, {}, this.getAdminToken());
    }

    public async updateFirm(id: number, data: any): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}firm_management/${id}/`, data, {}, this.getAdminToken());
    }

    public async deleteFirm(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}firm_management/${id}/`, {}, {}, this.getAdminToken());
    }

    public async getLastSales(): Promise<ILastSale[]> {
        return (await apiWebBackendService.get<IResponse<ILastSale[]>>(`${this.PATH}last_sale/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async downloadSymbols(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_symbols/`, data, {}, this.getAdminToken()));
    }

    public async downloadLastSales(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_last_sales/`, data, {}, this.getAdminToken()));
    }

    public async getDocs(): Promise<IDoc[]> {
        return (await apiWebBackendService.get<IResponse<IDoc[]>>(`${this.PATH}doc/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async assignAccountType(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}assign_account_type/`, data, {}, this.getAdminToken()));
    }

    public async assignUserType(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}assign_user_type/`, data, {}, this.getAdminToken()));
    }

    public async assignCustomerType(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}assign_customer_type/`, data, {}, this.getAdminToken()));
    }

    public async assignDataFeedProvider(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}assign_data_feed_provider/`, data, {}, this.getAdminToken()));
    }

    public async getBestBidAndBestOffer(): Promise<IBestBidAndBestOffer[]> {
        return (await apiWebBackendService.get<IResponse<IBestBidAndBestOffer[]>>(`${this.PATH}bbo/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async downloadBestBidAndBestOffer(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_bbo/`, data, {}, this.getAdminToken()));
    }

    public async getFees(): Promise<IFees[]> {
        return (await apiWebBackendService.get<IResponse<IFees[]>>(`${this.PATH}fees/`, {}, this.getAdminToken())).data;
    }

    public async setFees(id: number, data: any): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}fees/${id}/`, data, {}, this.getAdminToken());
    }

    public async setServiceDescription(id: number, data: any): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}tariff/${id}/`, data, {}, this.getAdminToken());
    }

    public async getInvoices(params?: {}): Promise<IInvoice[]> {
        return (await apiWebBackendService.get<IResponse<IInvoice[]>>(`${this.PATH}invoices/`, params, this.getAdminToken())).data;
    }

    public async getBank(): Promise<IBank[]> {
        return (await apiWebBackendService.get<IResponse<IBank[]>>(`${this.PATH}banks/`, {}, this.getAdminToken())).data;
    }

    public async getFirmBank(): Promise<IBank[]> {
        return (await apiWebBackendService.get<IResponse<IBank[]>>(`${this.PATH}firm_banks/`, {}, this.getAdminToken())).data;
    }

    public async updateBank(data: any): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}banks/`, data, {}, this.getAdminToken());
    }

    public async createPayment(data: any): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}payments/`, data, {}, this.getAdminToken());
    }

    public async getMemberDistributions(data: any): Promise<IMemberDistribution[]> {
        return (await apiWebBackendService.post<IResponse<IMemberDistribution[]>>(`${this.PATH}member_distributions/`, data, {}, this.getAdminToken())).data;
    }

    public async getMemberDistributionHistory(): Promise<IMemberDistributionHistory[]> {
        return (await apiWebBackendService.get<IResponse<IMemberDistributionHistory[]>>(`${this.PATH}member_distributions/history/`, {}, this.getAdminToken())).data;
    }

    public async getMemberDistribution(params?: {}): Promise<IInvoice[]> {
        return (await apiWebBackendService.get<IResponse<IInvoice[]>>(`${this.PATH}member_distributions/`, params, this.getAdminToken())).data;
    }

    public async getMemberDistributionDates(): Promise<IResponse<any>> {
        return (await apiWebBackendService.get<IResponse<any>>(`${this.PATH}member_distributions/dates/`, {}, this.getAdminToken())).data;
    }

    public async getMemberDistributionStatistics(data: any): Promise<IChartStatistics[]> {
        return (await apiWebBackendService.post<IResponse<IChartStatistics[]>>(`${this.PATH}member_distributions/statistics/`, data, {}, this.getAdminToken())).data;
    }

    public async getOrders(): Promise<IOrder[]> {
        return (await apiWebBackendService.get<IResponse<IOrder[]>>(`${this.PATH}order/?limit=${this.queryLimit}`, {}, this.getAdminToken())).results;
    }

    public async downloadOrders(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_orders/`, data, {}, this.getAdminToken()));
    }

    public async getCompanyProfile(): Promise<Array<ICompanyProfile>> {
        return (await apiWebBackendService.get<IResponse<Array<ICompanyProfile>>>(`${this.PATH}company_profile/`, {}, this.getAdminToken())).data;
    }

    public async getDataFeedProviders(name?: string): Promise<IDataFeedProvider[]> {
        let queryString = "";
        if (name) {
            queryString += `&name=${name}`;
        }

        return (await apiWebBackendService.get<IResponse<IDataFeedProvider[]>>(`${this.PATH}data_feed_providers/?limit=${this.queryLimit}${queryString}`, {}, this.getAdminToken())).results;
    }

    public async getDataFeedProviderDates(): Promise<IResponse<any>> {
        return (await apiWebBackendService.get<IResponse<any>>(`${this.PATH}data_feed_providers/dates/`, {}, this.getAdminToken())).data;
    }

    public async getDataFeedProviderHistory(data: any): Promise<IResponse<any>> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}data_feed_providers/history/`, data, {}, this.getAdminToken())).data;
    }

    public async downloadDataFeedProviderHistory(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_data_feed_providers_history/`, data, {}, this.getAdminToken()));
    }


    public async createDataFeedProvider(data: any): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}data_feed_providers/`, data, {}, this.getAdminToken());
    }

    public async updateDataFeedProvider(id: number, data: any): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}data_feed_providers/${id}/`, data, {}, this.getAdminToken());
    }

    public async deleteDataFeedProvider(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}data_feed_providers/${id}/`, {}, {}, this.getAdminToken());
    }

    // **** Admin Tools **** //
    // Order Generator
    public async getOrderGeneratorStatus(): Promise<Array<{ status: boolean }>> {
        return (await apiWebBackendService.get<IResponse<Array<{
            status: boolean
        }>>>(`${this.PATH}tools/order_generator/status/`, {}, this.getAdminToken())).data;
    }

    public async setOrderGeneratorStatus(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}tools/order_generator/status/`, data, {}, this.getAdminToken()));
    }

    public async getOrderGeneratorSymbols(): Promise<Array<string>> {
        return (await apiWebBackendService.get<IResponse<Array<string>>>(`${this.PATH}tools/order_generator/symbols/`, {}, this.getAdminToken())).data;
    }

    public async addOrderGeneratorSymbol(data: any): Promise<Array<string>> {
        return (await apiWebBackendService.post<IResponse<Array<string>>>(`${this.PATH}tools/order_generator/symbols/`, data, {}, this.getAdminToken())).data;
    }

    public async deleteOrderGeneratorSymbol(symbol: string): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}tools/order_generator/symbols/${symbol}/`, {}, {}, this.getAdminToken());
    }

    public async deleteOrderGeneratorOrders(): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}tools/order_generator/clear/`, {}, {}, this.getAdminToken());
    }

    // Last Sale Generator
    public async getLastSaleGeneratorStatus(): Promise<Array<{ status: boolean }>> {
        return (await apiWebBackendService.get<IResponse<Array<{
            status: boolean
        }>>>(`${this.PATH}tools/last_sale_generator/status/`, {}, this.getAdminToken())).data;
    }

    public async setLastSaleGeneratorStatus(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}tools/last_sale_generator/status/`, data, {}, this.getAdminToken()));
    }

    public async getLastSaleGeneratorSymbols(): Promise<Array<string>> {
        return (await apiWebBackendService.get<IResponse<Array<string>>>(`${this.PATH}tools/last_sale_generator/symbols/`, {}, this.getAdminToken())).data;
    }

    public async addLastSaleGeneratorSymbol(data: any): Promise<Array<string>> {
        return (await apiWebBackendService.post<IResponse<Array<string>>>(`${this.PATH}tools/last_sale_generator/symbols/`, data, {}, this.getAdminToken())).data;
    }

    public async deleteLastSaleGeneratorSymbol(symbol: string): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}tools/last_sale_generator/symbols/${symbol}/`, {}, {}, this.getAdminToken());
    }

    public async deleteLastSaleGeneratorLastSales(): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}tools/last_sale_generator/clear/`, {}, {}, this.getAdminToken());
    }

    // Best Bid And Best Offer Generator
    public async getBestBidAndBestOfferGeneratorStatus(): Promise<Array<{ status: boolean }>> {
        return (await apiWebBackendService.get<IResponse<Array<{
            status: boolean
        }>>>(`${this.PATH}tools/bbo_generator/status/`, {}, this.getAdminToken())).data;
    }

    public async setBestBidAndBestOfferGeneratorStatus(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}tools/bbo_generator/status/`, data, {}, this.getAdminToken()));
    }

    public async getBestBidAndBestOfferGeneratorSymbols(): Promise<Array<string>> {
        return (await apiWebBackendService.get<IResponse<Array<string>>>(`${this.PATH}tools/bbo_generator/symbols/`, {}, this.getAdminToken())).data;
    }

    public async addBestBidAndBestOfferGeneratorSymbol(data: any): Promise<Array<string>> {
        return (await apiWebBackendService.post<IResponse<Array<string>>>(`${this.PATH}tools/bbo_generator/symbols/`, data, {}, this.getAdminToken())).data;
    }

    public async deleteBestBidAndBestOfferGeneratorSymbol(symbol: string): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}tools/bbo_generator/symbols/${symbol}/`, {}, {}, this.getAdminToken());
    }

    public async deleteBestBidAndBestOfferGeneratorLastSales(): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}tools/bbo_generator/clear/`, {}, {}, this.getAdminToken());
    }

    public async getNotification(): Promise<Array<INotificationChatMessage>> {
        return (await apiWebBackendService.get<IResponse<Array<INotificationChatMessage>>>(`${this.PATH}notification/`, {}, this.getAdminToken())).data;
    }

    public addNotification(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}notification/`, data, {}, this.getAdminToken())
    }

    public markAsReadNotification(): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}notification_mark_as_read/`, {}, {}, this.getAdminToken())
    }

    public async getDirectoryProfile(): Promise<Array<IDirectoryCompanyProfile>> {
        return (await apiWebBackendService.get<IResponse<Array<IDirectoryCompanyProfile>>>(`${this.PATH}directory_profile/`, {}, this.getAdminToken())).data;
    }

    public createDirectoryProfile(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}directory_profile/`, data, {}, this.getAdminToken())
    }

    public updateDirectoryProfile(id: number, data: any): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}directory_profile/${id}/`, data, {}, this.getAdminToken());
    }

    public async deleteDirectoryProfile(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}directory_profile/${id}/`, {}, {}, this.getAdminToken());
    }

    public async approveDirectoryProfile(id: number, is_approved: boolean): Promise<IResponseApi> {
        const data = {
            id: id,
            status: is_approved ? 'approved' : 'rejected',
        }
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}approve_directory_profile/`, data, {}, this.getAdminToken()));
    }

    public async aiToolsAssetProfile(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<string>>(`${this.PATH}ai_company_profile/`, data, {}, this.getAdminToken())).data;
    }

    public exportCompanyProfileToGoogleSpreadsheets(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}export_ai_company_profile/`, data, {}, this.getAdminToken());
    }

    public async getPendingAssets(symbol?: string | null, linked = false): Promise<ISymbol[]> {
        let queryString = "";
        if (symbol) {
            queryString += `&symbol=${symbol}`;
        }

        return (await apiWebBackendService.get<IResponse<ISymbol[]>>(`${this.PATH}asset_management_pending/?limit=${5000}${queryString}`, {}, this.getAdminToken())).results;
    }

    public async getPendingAssetsProcessing(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}asset_management_pending/`, data, {}, this.getAdminToken()));
    }

    public async getPendingAsset(symbol?: string | null): Promise<ISymbol[]> {
        let queryString = "";
        if (symbol) {
            queryString += `&symbol=${symbol}`;
        }

        return (await apiWebBackendService.get<IResponse<ISymbol[]>>(`${this.PATH}asset_management_pending/?limit=${this.queryLimit}${queryString}`, {}, this.getAdminToken())).results;
    }

    public async updatePendingAsset(data: any, id: number): Promise<IResponseApi> {
        return apiWebBackendService.put<IResponseApi>(`${this.PATH}asset_management_pending/${id}/`, data, {}, this.getAdminToken());
    }

    public async approvePendingAsset(id: number, is_approved: boolean): Promise<IResponseApi> {
        const data = {
            status: is_approved ? 'approved' : 'rejected',
            is_approval: true
        }

        return (await apiWebBackendService.put<IResponseApi>(`${this.PATH}asset_management_pending/${id}/`, data, {}, this.getAdminToken()));
    }

    public async deletePendingAsset(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}asset_management_pending/${id}/`, {}, {}, this.getAdminToken());
    }
}

const adminService = new AdminService();

export default adminService;
