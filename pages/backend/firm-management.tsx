import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import FirmsBlock from "@/components/backend/firms-block";

const FirmManagement: NextPageWithLayout = () => {

    return (
        <>
            <FirmsBlock/>
        </>
    )
}

FirmManagement.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

FirmManagement.layoutName = "BackendLayout"

export default FirmManagement
