import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BlacklistBlock from "@/components/backend/blacklist-block";
import BackendLayout from "@/components/layouts/backend/backend-layout";

const Blacklist: NextPageWithLayout = () => {

    return (
        <>
           <BlacklistBlock/>
        </>
    )
}

Blacklist.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

export default Blacklist
