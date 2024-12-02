import {NextPageWithLayout} from "@/pages/_app";
import React, {ReactElement, useEffect, useState} from "react";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import CompanyProfilePageForm from "@/components/company-profile-page-form";
import LoaderBlock from "@/components/loader-block";

const Edit: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;
    const [isFormMounted, setFormMounted] = useState(false);
    const [currentSymbol, setCurrentSymbol] = useState(symbol);

    useEffect(() => {
        setCurrentSymbol(symbol);
    }, [symbol]);

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
            setCurrentSymbol(symbol);
            router.push(`/asset-profiles/${symbol}${queryString}`);
        }
    };

    return (
        <>
            <CompanyProfilePageForm action={'edit'} symbol={currentSymbol} onCallback={onCallback}/>
        </>
    );
};


Edit.getLayout = function getLayout(page: ReactElement) {
    return <PortalLayout>{page}</PortalLayout>;
};

Edit.layoutName = "PortalLayout";

export default Edit;
