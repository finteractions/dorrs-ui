import React, {ReactElement, useContext} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import MembershipBlock from "@/components/membership-block";
import IndicatorBlock from "@/components/indicator-block";
import {DataContext} from "@/contextes/data-context";
import {AccountType} from "@/enums/account-type";
import UserPortalBlock from "@/components/user-portal-block";
import {useRouter} from "next/router";

const Dashboard: NextPageWithLayout = () => {

    const dataContext = useContext(DataContext);
    const accountType: AccountType = dataContext.userProfile.account_type;
    const router = useRouter();

    const onCallback = (key: string, mode: string) => {
        if (key === 'asset_profile') {
            router.push(`/asset-profiles/${mode}`)
        } else if (key === 'symbol') {
            router.push(`/symbols/${mode}`)
        }
    }

    const components: Map<AccountType, any> = new Map<AccountType, any>()
        .set(AccountType.DORRS_ADMIN,
            <MembershipBlock/>)
        .set(AccountType.DORRS_MEMBER,
            <MembershipBlock/>)
        .set(AccountType.USER_PORTAL,
            <UserPortalBlock/>)

    return (
        <>
            <div className={'flex-panel-box'}>
                {components.get(accountType)}
                <IndicatorBlock onCallback={onCallback}/>
            </div>

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

Dashboard.layoutName = "PortalLayout"

export default Dashboard
