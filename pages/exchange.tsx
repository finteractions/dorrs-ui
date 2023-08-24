import React, { ReactElement, useState } from "react"
import type { NextPageWithLayout } from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import ExchangeForm from "../components/exchange-form";

const Exchange: NextPageWithLayout = () => {
    const [isExchange, setIsExchange] = useState<boolean>(true);

    return (
        <div className="exchange section">
            {isExchange && (
                <div className="content__top d-block text-center">
                    <div className="content__title">Exchange</div>
                    <p>Create a request to exchange your assets</p>
                </div>
            )}
            <ExchangeForm
                onSubmit={() => setIsExchange(false)}
                onBack={() => setIsExchange(true)} />
        </div>
    )
}

Exchange.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

export default Exchange
