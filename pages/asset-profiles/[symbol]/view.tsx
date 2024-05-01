import React, {ReactElement, useContext, useState} from "react"
import type {NextPageWithLayout} from "../../_app";
import PortalLayout from "../../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import CompanyProfileBlock from "@/components/company-profile-block";
import CompanyProfileContainer from "@/components/company-profile-container";
import {DataContext} from "@/contextes/data-context";


const View: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;
    const shared = useContext(DataContext);


    const onCallback = (logo: string, mode?: string, toSymbol?: boolean) => {
        if(!toSymbol){
            let queryString = "";
            if (mode) {
                queryString += `/${mode}`;
                router.push(`/asset-profiles/${symbol}${queryString}`)
            } else {
                shared.setSharedData({logo: logo})
            }
        }else {
            router.push(`/symbols/${logo}/view`)
        }

    }

    return (
        <CompanyProfileBlock onCallback={onCallback} symbol={symbol}/>
    )
}


View.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <CompanyProfileContainer>
                {page}
            </CompanyProfileContainer>
        </PortalLayout>
    )
}

View.layoutName = "PortalLayout"

export default View
