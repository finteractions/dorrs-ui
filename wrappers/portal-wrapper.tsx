import React, { useContext, useEffect } from "react";
import { DataContext } from "@/contextes/data-context";
import LoaderBlock from "@/components/loader-block";

export default function portalWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {
        const dataContext = useContext(DataContext);
        const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

        useEffect(() => {

        }, [dataContext, fetchIntervalSec]);

        return (
            <>
                {dataContext.userProfile ? (
                    <Component {...props} />
                ) : (
                    <div className="pre-loader">
                        <LoaderBlock/>
                    </div>
                )}
            </>
        );
    };
}
