import {NextPageWithLayout} from "@/pages/_app";
import React, {ReactElement} from "react";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import CompanyProfilePageForm from "@/components/company-profile-page-form";

const Edit: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
            router.push(`/asset-profiles/${symbol}${queryString}`)
        }
    }

    return (
        <CompanyProfilePageForm action={'edit'} symbol={symbol} onCallback={onCallback}/>
    )
}


Edit.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Edit.layoutName = "PortalLayout"

export default Edit
