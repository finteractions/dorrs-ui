import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import AssetsBlock from "@/components/assets-block";


const Assets: NextPageWithLayout = () => {
    return (
        <AssetsBlock isDashboard={false} />
    )
}

Assets.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Assets.layoutName = "PortalLayout";

export default Assets
