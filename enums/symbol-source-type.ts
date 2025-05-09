export enum SymbolSourceType {
    OPEN_AI = 'open_ai',
    INX = 'inx',
    FORGE_GLOBAL = 'forge_global',
}


export const SymbolSourceNames = {
    [SymbolSourceType.OPEN_AI]: 'Open AI',
    [SymbolSourceType.INX]: 'inx.co',
    [SymbolSourceType.FORGE_GLOBAL]: 'forgeglobal.com',
};


export const getSymbolSourceTypeName = <T extends SymbolSourceType>(type: T): string => {
    return SymbolSourceNames[type] || '';
};
