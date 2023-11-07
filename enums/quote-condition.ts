export enum QuoteCondition {
    h = 'H',
    b = 'B',
    a = 'A',
}

export const QuoteConditionDescriptions = {
    [QuoteCondition.h]: 'if manual on both the bid and ask',
    [QuoteCondition.b]: 'if manual on the bid',
    [QuoteCondition.a]: 'if manual on the offer',
};

export const getQuoteConditionDescriptions = <T extends QuoteCondition>(quoteCondition: T): string => {
    return QuoteConditionDescriptions[quoteCondition] || '';
};
