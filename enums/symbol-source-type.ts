export enum SymbolSourceType {
    OPEN_AI = 'open_ai',
    INX = 'inx',
    FORGE_GLOBAL = 'forge_global',
}

export enum SymbolSourceExtendedType {
    FORM = 'form'
}


export const SymbolSourceNames = {
    [SymbolSourceType.OPEN_AI]: 'Open AI',
    [SymbolSourceType.INX]: 'inx.co',
    [SymbolSourceType.FORGE_GLOBAL]: 'forgeglobal.com',
    [SymbolSourceExtendedType.FORM]: 'Form',
};

export type SymbolSourceUnionType = SymbolSourceType | SymbolSourceExtendedType;

export const getSymbolSourceTypeName = <T extends SymbolSourceUnionType>(type: T): string => {
    return SymbolSourceNames[type] || '';
};
