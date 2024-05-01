import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import CompanyProfilesPortalBlock from "@/components/company-profiles-portal-block";


const AssetProfiles: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
        }
        router.push(`/asset-profiles/${symbol}${queryString}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <CompanyProfilesPortalBlock
                    onCallback={onCallback}
                />
            </div>
        </>
    )
}

AssetProfiles.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

AssetProfiles.layoutName = "PortalLayout"

export default AssetProfiles
