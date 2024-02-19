import React, {ReactElement, useContext, useState} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import CompanyProfileBlock from "@/components/company-profile-block";
import CompanyProfileContainer from "@/components/company-profile-container";
import {DataContext} from "@/contextes/data-context";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;
    const shared = useContext(DataContext);


    const onCallback = (logo: string) => {
        shared.setSharedData({logo: logo})
    }

    return (
        <CompanyProfileBlock onCallback={onCallback} symbol={symbol}/>
    )
}


Symbol.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <CompanyProfileContainer>
                {page}
            </CompanyProfileContainer>
        </PortalLayout>
    )
}

Symbol.layoutName = "PortalLayout"

export default Symbol
