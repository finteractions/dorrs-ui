import React, { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import {GetLayout, LayoutNameProvider} from "@/components/layouts/utils/layout-utils";
import DirectoryBlock from "@/components/public-directory/directory-block";

const PublicDirectory: NextPageWithLayout = () => {
    return (
        <>
            <DirectoryBlock/>
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
