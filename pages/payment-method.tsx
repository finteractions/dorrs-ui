import React, { ReactElement} from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import ProfileContainer from "../components/profile-container";
import PaymentMethodBlock from "@/components/payment-method-block";

const PaymentMethod: NextPageWithLayout = () => {

    return (
       <PaymentMethodBlock />
    )
}

PaymentMethod.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <ProfileContainer>
                {page}
            </ProfileContainer>
        </PortalLayout>
    )
}

PaymentMethod.layoutName = "PortalLayout"

export default PaymentMethod
