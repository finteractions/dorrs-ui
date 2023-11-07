const comparison_matrix: Record<string, string> = {
    'SymbolBlock': 'security',
    'CompanyProfile': 'company_profile',
    'LastSaleReportingBlock':'last_sale_reporting',
    'LastSaleDataHistoryBlock':'last_sale_data_history',
    'BBOBlock':'bbo',
}

function getAccessRulesByComponent(component_name: string, access_matrix: any[]) {
    const permission_row = access_matrix.filter(i => i.key === comparison_matrix[component_name])
    return permission_row?.[0]?.values || {view: false, create: false, edit: false, delete: false};
}

function filterMenuByAccess(menu: any[], access_matrix: any[]) {
    const allowed_keys = access_matrix.filter(rule => rule.values.view).map(rule => rule.key);
    return menu.filter(item => !item.permission_key || allowed_keys.includes(item.permission_key));
}

const userPermissionService = {
    getAccessRulesByComponent,
    filterMenuByAccess
}

export default userPermissionService;
