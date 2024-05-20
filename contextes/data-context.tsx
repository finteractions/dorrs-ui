import React, {useContext, useEffect, useState} from 'react';
import cryptoService from "@/services/crypto/crypto-service";
import userService from "@/services/user/user-service";
import {IUserAssetData} from "@/interfaces/i-user-asset-data";
import {IUserAsset} from "@/interfaces/i-user-asset";
import authService from "@/services/auth/auth-service";
import {AuthUserContext} from "@/contextes/auth-user-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import {useRouter} from "next/router";
import {IUserProfile} from "@/interfaces/i-user-profile";

const DataContext = React.createContext<any>(null);
const {Provider} = DataContext;

const DataProvider = <T extends any>({children}: { children: React.ReactNode }) => {
    const [userAssets, setUserAssets] = useState<IUserAssetData | null>(null);
    const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
    const [emailVerified, setEmailVerified] = useState<IEmailVerified | null>(null);
    const [sharedData, setSharedData] = useState<T | null>(null)
    const [errors, setErrors] = useState<Map<string, string[]>>(new Map());
    const [userProfileLoading, setUserProfileLoading] = useState(true);
    const authUserContext = useContext(AuthUserContext);
    const authAdminContext = useContext(AuthAdminContext);
    const router = useRouter();
    const getUserAssets = async (withCreate: boolean = false) => {
        (withCreate ? cryptoService.addUserAssets(null) : Promise.resolve(true))
            .then((success: boolean) => {
            })
            .catch((errMsg: string[]) => {
            })
            .finally(() => {
                cryptoService.getUserAssets()
                    .then((userAssets) => {
                        userAssets.crypto.forEach((cryptoItem: IUserAsset) => {
                            cryptoItem.asset.min_withdraw = 0.00000001;
                            cryptoItem.asset.min_exchange = 0.00000001;
                            cryptoItem.asset.fees = 0;
                            cryptoItem.asset.decimals = 8;
                        });
                        userAssets.crypto.sort((a: IUserAsset, b: IUserAsset) => b.id - a.id);

                        userAssets.fiat.forEach((fiatItem: IUserAsset) => {
                            fiatItem.asset.min_withdraw = 100;
                            fiatItem.asset.min_exchange = 0.01;
                            fiatItem.asset.fees = 0;
                            fiatItem.asset.decimals = 2;
                        });
                        userAssets.fiat.sort((a: IUserAsset, b: IUserAsset) => b.id - a.id)

                        setUserAssets(userAssets)
                    })
                    .catch((errMsg: Array<string>) => {
                        setErrors(new Map(errors.set('userAssets', errMsg)))
                    });
            });
    }

    const getUserProfile = async () => {
        setUserProfileLoading(true);

        userService.getUserProfile()
            .then((userProfile: IUserProfile) => {

                if (!userProfile.is_enabled) {
                    router.push('/registration')
                } else {

                }
                setUserProfile(userProfile)
            })
            .catch((errMsg: Array<string>) => {
                setErrors(new Map(errors.set('userProfile', errMsg)))
            }).finally(() => {
            setUserProfileLoading(false);
        })
    }

    const getEmailStatus = async () => {
        authService.createEmailStatus()
            .then((emailVerified: IEmailVerified) => {
                setEmailVerified(emailVerified)
            })
            .catch((errMsg: Array<string>) => {
                setErrors(new Map(errors.set('emailVerified', errMsg)))
            })
    }

    const getSharedData = () => {
        const data = sharedData;
        setSharedData(null);
        return data;
    }

    const clearUserData = () => {
        setUserAssets(null);
        setUserProfile(null);
        setSharedData(null);
        setErrors(new Map());
    };

    const initData = async () => {
        // getEmailStatus()
        // getUserAssets(true);
        getUserProfile();
    };

    useEffect(() => {
        initData();
    }, []);

    return (
        <Provider
            value={{
                userAssets,
                getUserAssets,
                userProfile,
                getUserProfile,
                getEmailStatus,
                setSharedData: (data: T) => setSharedData(data),
                getSharedData,
                clearUserData,
                errors,
                userProfileLoading
            }}
        >
            {children}
        </Provider>
    );
};

export {DataContext, DataProvider};
