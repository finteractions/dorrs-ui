export enum OrderStatus {
    OPEN = 'open',
    CLOSED = 'closed',
}


export const OrderStatusNames = {
    [OrderStatus.OPEN]: 'Open',
    [OrderStatus.CLOSED]: 'Closed',
};

export const getOrderStatusNames = <T extends OrderStatus>(status: T): string => {
    return OrderStatusNames[status] || '';
};
