import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import CompanyProfilesBlock from "@/components/company-profiles-block";
import {useRouter} from "next/router";


const CompanyProfile: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/symbols/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <CompanyProfilesBlock onCallback={onCallback}/>
            </div>
        </>
    )
}

CompanyProfile.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

CompanyProfile.layoutName = "PortalLayout"

export default CompanyProfile
