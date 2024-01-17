export enum OrderSide {
    b = 'B',
    s = 'S',
}

export const OrderSideDescriptions = {
    [OrderSide.b]: 'bid',
    [OrderSide.s]: 'offer',
};

export const getOrderSideDescriptions = <T extends OrderSide>(OrderSide: T): string => {
    return OrderSideDescriptions[OrderSide] || '';
};
