import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import OrdersBlock from "@/components/backend/order-block";

const Orders: NextPageWithLayout = () => {

    return (
        <>
            <OrdersBlock/>
        </>
    )
}

Orders.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Orders.layoutName = "BackendLayout"

export default Orders
