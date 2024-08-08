import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import PublicDirectoryBlock from "@/components/backend/public-directory-block";

const PublicDirectory: NextPageWithLayout = () => {

    return (
        <>
            <PublicDirectoryBlock />
        </>
    )
}

PublicDirectory.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

PublicDirectory.layoutName = "BackendLayout"

export default PublicDirectory
