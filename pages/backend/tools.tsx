import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import OrderGeneratorBlock from "@/components/backend/order-generator-block";


const Tools: NextPageWithLayout = () => {

    return (
        <>
            <OrderGeneratorBlock/>
        </>
    )
}


Tools.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Tools.layoutName = "BackendLayout";

export default Tools
