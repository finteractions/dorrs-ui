export enum QuoteCondition {
    b = 'B',
    a = 'A',
    h = 'H',
}

export const QuoteConditionDescriptions = {
    [QuoteCondition.b]: 'if manual on the bid',
    [QuoteCondition.a]: 'if manual on the offer',
    [QuoteCondition.h]: 'if manual on both the bid and ask',
};

export const getQuoteConditionDescriptions = <T extends QuoteCondition>(quoteCondition: T): string => {
    return QuoteConditionDescriptions[quoteCondition] || '';
};
