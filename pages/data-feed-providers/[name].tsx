import React, {ReactElement, useContext} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import DataFeedProviderContainer from "@/components/data-feed-provider-container";
import {DataContext} from "@/contextes/data-context";
import DataFeedProviderBlock from "@/components/data-feed-provider-block";


const Name: NextPageWithLayout = () => {
    const router = useRouter();
    const name = router.query.name as string;
    const shared = useContext(DataContext);

    const onCallback = (dataFeedProvider: IDataFeedProvider) => {
        shared.setSharedData(dataFeedProvider)
    }

    return (
        <DataFeedProviderBlock onCallback={onCallback} name={name}/>
    )
}


Name.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <DataFeedProviderContainer>
                {page}
            </DataFeedProviderContainer>
        </PortalLayout>
    )
}

Name.layoutName = "PortalLayout"

export default Name
