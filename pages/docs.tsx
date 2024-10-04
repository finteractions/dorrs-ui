import React, {ReactElement} from "react"
import PortalLayout from "@/components/layouts/portal/portal-layout";
import type {NextPageWithLayout} from "./_app";
import DocsBlock from "@/components/docs-block";


const Docs: NextPageWithLayout = () => {
    return (
        <div className="flex-panel-box">
            <DocsBlock/>
        </div>
    )
}

Docs.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Docs.layoutName = "PortalLayout"

export default Docs
