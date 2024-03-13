export enum DigitalAssetCategory {
    MONEY_OR_MONEY_LIKE_DIGITAL_ASSETS = "Money or Money-Like Digital Assets",
    FINANCIAL_DIGITAL_ASSETS = "Financial Digital Assets",
    ALTERNATIVE_DIGITAL_ASSETS = "Alternative Digital Assets",
    CRYPTOASSETS = "Cryptoassets",
    FUNCTIONAL_DIGITAL_ASSETS = "Functional Digital Assets",
    SETTLEMENT_CONTROLLABLE_ELECTRONIC_RECORDS = "Settlement Controllable Electronic Records",
    OTHER_DIGITAL_ASSETS = "Other Digital Assets",
}

export enum DigitalAssetCategoryInstrumentType_1 {
    CENTRAL_BANK_DIGITAL_CURRENCY = "Central Bank Digital Currency",
    BANK_DEPOSIT = "Bank Deposit",
    RESERVED_BANK_DIGITAL_CURRENCIES = "Reserved Bank Digital Currencies",
    STABLECOINS = "Stablecoins",
}

export enum DigitalAssetCategoryInstrumentType_2 {
    TOKENIZED_SECURITY_TWIN = "Tokenized Security (Twin)",
    SECURITY_TOKEN_NATIVE = "Security Token (Native)",
    TOKENIZED_DERIVATIVE_TWIN = "Tokenized Derivative (Twin)",
    DERIVATIVE_TOKEN_NATIVE = "Derivative Token (Native)",
}

export enum DigitalAssetCategoryInstrumentType_3 {
    TOKENIZED_ALTERNATIVE_ASSET_TWIN = "Tokenized Alternative Asset (Twin)"
}

export enum DigitalAssetCategoryInstrumentType_4 {
    PLATFORM_CRYPTOASSET = "Platform Cryptoasset (e.g. Bitcoin, Ether)",
    OTHER_CRYPTOASSETS = "Other Cryptoassets (Meme Coins)"
}

export enum DigitalAssetCategoryInstrumentType_5 {
    UTILITY_TOKEN = "Utility Token"
}

export enum DigitalAssetCategoryInstrumentType_6 {
    TRANSFER_OF_OWNERSHIP = "Transfer of Ownership"
}
export const DigitalAssetCategoryInstrument = {
    [DigitalAssetCategory.MONEY_OR_MONEY_LIKE_DIGITAL_ASSETS]: DigitalAssetCategoryInstrumentType_1,
    [DigitalAssetCategory.FINANCIAL_DIGITAL_ASSETS]: DigitalAssetCategoryInstrumentType_2,
    [DigitalAssetCategory.ALTERNATIVE_DIGITAL_ASSETS]: DigitalAssetCategoryInstrumentType_3,
    [DigitalAssetCategory.CRYPTOASSETS]: DigitalAssetCategoryInstrumentType_4,
    [DigitalAssetCategory.FUNCTIONAL_DIGITAL_ASSETS]: DigitalAssetCategoryInstrumentType_5,
    [DigitalAssetCategory.SETTLEMENT_CONTROLLABLE_ELECTRONIC_RECORDS]: DigitalAssetCategoryInstrumentType_6,
    [DigitalAssetCategory.OTHER_DIGITAL_ASSETS]: null
}

export function getDigitalAssetCategoryInstrument(value: string): any {
    return DigitalAssetCategoryInstrument[value as keyof typeof DigitalAssetCategoryInstrument]
}
