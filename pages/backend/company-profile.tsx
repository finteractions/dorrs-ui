import React, {ReactElement} from "react"
import CompanyProfilesBlock from "@/components/company-profiles-block";
import {useRouter} from "next/router";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import {NextPageWithLayout} from "@/pages/_app";


const CompanyProfile: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {

    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <CompanyProfilesBlock
                    onCallback={onCallback}
                    access={{create: true, delete: true, edit: true, view: true}}
                    isAdmin={true}
                />
            </div>
        </>
    )
}

CompanyProfile.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

CompanyProfile.layoutName = "BackendLayout"

export default CompanyProfile
