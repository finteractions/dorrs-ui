export enum AlternativeAssetCategory {
    PRIVATE_FUNDS = 'Private Funds',
    REAL_ESTATE = 'Real Estate',
    COLLECTIBLES = 'Collectibles'
}

export enum AlternativeAssetCategory_1 {
    TRADITIONAL = 'Traditional 3(c) (1) Fund (no more than 100 beneficial owners)',
    THREE_C_7 = '3 (c) (7) Fund (limited to qualified purchasers)',
    THREE_C_1 = '3(c) (1) Qualifying Venture Capital Fund (no more than $10M from no more than 250 beneficial owners)'
}

export enum AlternativeAssetCategory_2 {
    COMMERCIAL = 'Commercial',
    RESIDENTIAL = 'Residential'
}

export enum AlternativeAssetCategory_3 {
    BOOK = 'Books',
    CARS = 'Cars',
    COMICS = 'Comics',
    ONE_OF_A_KIND_COLLECTIBLES = 'One-of-a-kind collectibles',
    SPORTS_CARDS_AND_MEMORABILIA = 'Sports cards and memorabilia',
    TRADING_CARDS = 'Trading cards'
}

export const AlternativeAssetSubCategory = {
    [AlternativeAssetCategory.PRIVATE_FUNDS]: AlternativeAssetCategory_1,
    [AlternativeAssetCategory.REAL_ESTATE]: AlternativeAssetCategory_2,
    [AlternativeAssetCategory.COLLECTIBLES]: AlternativeAssetCategory_3
}

export function getAlternativeAssetSubCategory(value: string): any {
    return AlternativeAssetSubCategory[value as keyof typeof AlternativeAssetSubCategory]
}
