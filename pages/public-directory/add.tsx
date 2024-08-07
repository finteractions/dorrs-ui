import {NextPageWithLayout} from "@/pages/_app";
import React, {ReactElement} from "react";
import {useRouter} from "next/router";
import PublicDirectoryPageForm from "@/components/public-directory-page-form";
import {GetLayout, LayoutNameProvider} from "@/components/layouts/utils/layout-utils";

const Add: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = () => {
        router.push(`/public-directory`)
    }

    return (
        <PublicDirectoryPageForm action={'add'} onCallback={onCallback}/>
    )
}


Add.getLayout = function getLayout(page: ReactElement) {
    return (
        <LayoutNameProvider>
            <GetLayout page={page} />
        </LayoutNameProvider>
    );
}

Add.layoutName = "PortalLayout"

export default Add
