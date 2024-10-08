const comparison_matrix: Record<string, string> = {
    'SymbolBlock': 'security',
    'CompanyProfileBlock': 'company_profile',
    'LastSaleReportingBlock': 'last_sale_reporting',
    'BestBidAndBestOfferBlock': 'bbo',
    'WeeklyAndMonthlyReportsBlock': 'weekly_and_monthly_reports',
    'DepthOfBookBlock': 'dob',
    'QuoteBoardBlock': 'quote_board',
    'DataFeedProvidersBlock': 'data_feed_providers',
    'AlgorandDataFeedBlock': 'algorand_data_feed'
}

function getAccessRulesByComponent(component_name: string, access_matrix: any[]) {
    const permission_row = access_matrix.filter(i => i.key === comparison_matrix[component_name])
    return permission_row?.[0]?.values || {view: false, create: false, edit: false, delete: false};
}

function getAccessRulesByKey(key: string, access_matrix: any[]) {
    const permission_row = access_matrix.filter(i => i.key === key)
    return {
        name: permission_row?.[0]?.name || '',
        values: permission_row?.[0]?.values || {view: false, create: false, edit: false, delete: false}
    }
}

function filterMenuByAccess(menu: any[], access_matrix: any[]) {
    const allowed_keys = access_matrix?.filter(rule => rule.values.view).map(rule => rule.key);
    return menu.filter(item => !item.permission_key || allowed_keys?.includes(item.permission_key));
}

const userPermissionService = {
    getAccessRulesByComponent,
    getAccessRulesByKey,
    filterMenuByAccess
}

export default userPermissionService;
