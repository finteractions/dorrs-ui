export enum QuoteCondition {
    c = 'C',
    b = 'B',
    a = 'A',
    h = 'H',
}

export const QuoteConditionDescriptions = {
    [QuoteCondition.c]: 'automated Bid and Ask',
    [QuoteCondition.b]: 'if manual on the bid',
    [QuoteCondition.a]: 'if manual on the offer',
    [QuoteCondition.h]: 'if manual on both the bid and ask',
};

export const getQuoteConditionDescriptions = <T extends QuoteCondition>(quoteCondition: T): string => {
    return QuoteConditionDescriptions[quoteCondition] || '';
};

export const getBidQuoteCondition = (): QuoteCondition[] => {
    return [QuoteCondition.b, QuoteCondition.c, QuoteCondition.h];
};

export const getOfferQuoteCondition = (): QuoteCondition[] => {
    return [QuoteCondition.a, QuoteCondition.c, QuoteCondition.h];
};
