import React, {ReactElement, useContext} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import FiatBlock from "../components/fiat-block";
import AssetsBlock from "../components/assets-block";
import TransactionsBlock from "../components/transactions-block";
import {IUserAsset} from "@/interfaces/i-user-asset";
import {useRouter} from "next/router";
import {DataContext} from "@/contextes/data-context";

const Dashboard: NextPageWithLayout = () => {
    const router = useRouter();
    const {setSharedData} = useContext(DataContext);
    const navigateToFiat = (userAsset: IUserAsset | null) => {
        setSharedData(userAsset);

        router.push('/fiats')
    }

    const navigateToCrypto = (userAsset: IUserAsset | null) => {
        setSharedData(userAsset);

        router.push('/assets')
    }

    return (
        <>
            <FiatBlock navigateToFiat={navigateToFiat}/>
            <AssetsBlock navigateToCrypto={navigateToCrypto}/>
            <TransactionsBlock title="Last Transactions"/>
        </>
    )
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

export default Dashboard
