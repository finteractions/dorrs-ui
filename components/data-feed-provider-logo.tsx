import React, {useContext, useEffect, useState} from "react";
import {DataContext} from "@/contextes/data-context";
import LoaderBlock from "@/components/loader-block";
import Image from "next/image";
import AssetImage from "@/components/asset-image";

const DataFeedProviderLogo = () => {
    const context = useContext(DataContext);
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        if (context && context.getSharedData()) {
            const dataFeedProvider = context.getSharedData();
            const logo = dataFeedProvider?.logo
            setLogo(logo ?? "")
        }

    }, [context])

    return (
        <>
            <div className={"logo"}>
                {logo === null ? (
                    <LoaderBlock/>
                ) : (
                    <AssetImage alt='' src={logo}
                                width={225} />
                )}

            </div>
        </>
    );
};

export default DataFeedProviderLogo;
