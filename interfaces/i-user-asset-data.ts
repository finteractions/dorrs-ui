import {IUserAsset} from "@/interfaces/i-user-asset";

export interface IUserAssetData {
    crypto: Array<IUserAsset>;
    fiat: Array<IUserAsset>;
}
