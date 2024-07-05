import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PublicLayout from "@/components/layouts/public/public-layout";

const PublicDashboard: NextPageWithLayout = () => {

    return (
        <>
            IN DEVELOPMENT
        </>
    )
}

PublicDashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <PublicLayout>
            {page}
        </PublicLayout>
    )
}

PublicDashboard.layoutName = "PublicLayout"

export default PublicDashboard
