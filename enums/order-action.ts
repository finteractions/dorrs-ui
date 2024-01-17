export enum OrderAction {
    n = 'N',
    a = 'A',
    r = 'R',
}

export const OrderActionDescriptions = {
    [OrderAction.n]: 'new order',
    [OrderAction.a]: 'add order',
    [OrderAction.r]: 'remove order',
};

export const OrderActionValue: { [key: string]: OrderAction } = {
    'new': OrderAction.n,
    'add': OrderAction.a,
    'remove': OrderAction.r,
    'delete': OrderAction.r,
};

export const getOrderActionDescriptions = (orderAction: OrderAction): string => {
    return OrderActionDescriptions[orderAction] || '';
};

export const getOrderActionByName = (name: any): OrderAction => {
    return OrderActionValue[name] || '';
}
