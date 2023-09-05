import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import MembershipFormsBlock from "@/components/backend/membership-forms-block";


const MembershipForm: NextPageWithLayout = () => {
    return (
        <>
            <MembershipFormsBlock/>
        </>
    )
}

MembershipForm.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

export default MembershipForm
