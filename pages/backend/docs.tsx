import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import DocsBlock from "@/components/backend/docs-block";


const Docs: NextPageWithLayout = () => {
    return (
        <>
            <DocsBlock/>
        </>
    )
}

Docs.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Docs.layoutName = "BackendLayout"

export default Docs
