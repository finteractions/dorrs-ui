import React, { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import {GetLayout, LayoutNameProvider} from "@/components/layouts/utils/layout-utils";
import DirectoryBlock from "@/components/public-directory/directory-block";
import {useRouter} from "next/router";

const PublicDirectory: NextPageWithLayout = () => {
    const router = useRouter();

    const onCallback = async (linkTo: string) => {
        await router.push(linkTo)
    }

    return (
        <>
            <DirectoryBlock onCallback={onCallback}/>
        </>
    );
};

PublicDirectory.getLayout = function getLayout(page: ReactElement) {
    return (
        <LayoutNameProvider>
            <GetLayout page={page} />
        </LayoutNameProvider>
    );
};

PublicDirectory.layoutName = "PublicLayout";

export default PublicDirectory;
