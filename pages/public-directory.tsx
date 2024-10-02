import React, { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DirectoryBlock from "@/components/public-directory/directory-block";
import {useRouter} from "next/router";
import PortalLayout from "@/components/layouts/portal/portal-layout";

const PublicDirectory: NextPageWithLayout = () => {
    const router = useRouter();

    const onCallback = (linkTo: string) => {
        window.open(linkTo, '_blank');
    }


    return (
        <>
            <DirectoryBlock onCallback={onCallback}/>
        </>
    );
};

PublicDirectory.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    );
};

PublicDirectory.layoutName = "PortalLayout";

export default PublicDirectory;
