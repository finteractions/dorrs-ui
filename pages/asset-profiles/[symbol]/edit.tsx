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
        if (symbol && symbol !== currentSymbol) {
            setFormMounted(false);
            setTimeout(() => {
                setCurrentSymbol(symbol);
                setFormMounted(true);
            }, 100);
        } else if (symbol && !isFormMounted) {
            setFormMounted(true);
        }
    }, [symbol, currentSymbol, isFormMounted]);

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
            router.push(`/asset-profiles/${symbol}${queryString}`);
        }
    };

    return (
        <>
            {!isFormMounted ? (
                <LoaderBlock/>
            ) : (
        <CompanyProfilePageForm action={'edit'} symbol={symbol} onCallback={onCallback} />
            )}
        </>
    );
};



Edit.getLayout = function getLayout(page: ReactElement) {
    return <PortalLayout>{page}</PortalLayout>;
};

Edit.layoutName = "PortalLayout";

export default Edit;
