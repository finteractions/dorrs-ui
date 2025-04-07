import {FormStatus} from "@/enums/form-status";

export enum AssetStatus {
    ACTIVE = 'Active',
    HALTED = 'Halted',
    DELISTED = 'Delisted',
    RESERVE_SPLIT = 'Reserve Split',
    SPLIT = 'Split',
    IPO = 'IPO',
    ARCHIVED = 'Archived'
}

export const getNonEditableStatus = (): AssetStatus[] => {
    return [AssetStatus.IPO, AssetStatus.ARCHIVED];
};
