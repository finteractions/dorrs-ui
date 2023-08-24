import {IUserAssetData} from "@/interfaces/i-user-asset-data";

export interface IDataContext<T> {
    userAssets: IUserAssetData;
    getUserAssets: () => void;
    userProfile: IUserProfile;
    getUserProfile: () => void;
    sharedData: T | null;
    setSharedData: (data: T) => void;
    clearUserData: () => void;
    errors: Map<string, Array<string>>;
}
