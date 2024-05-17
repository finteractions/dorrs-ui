import React, {ReactElement} from "react"
import {useRouter} from "next/router";
import {NextPageWithLayout} from "@/pages/_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import DataFeedProviderBlock from "@/components/backend/data-feed-provider-block";


const Name: NextPageWithLayout = () => {
    const router = useRouter();
    const name = router.query.name as string;
    const onCallback = (email:string) => {
        router.push(`/backend/user-management/?user=${encodeURIComponent(email || '')}`);
    }

    return (
        <DataFeedProviderBlock onCallback={onCallback} name={name}/>
    )
}


Name.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Name.layoutName = "BackendLayout"

export default Name
