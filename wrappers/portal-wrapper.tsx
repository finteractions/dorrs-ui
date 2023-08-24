import React, { useContext, useEffect } from "react";
import { DataContext } from "@/contextes/data-context";

export default function portalWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {
        const dataContext = useContext(DataContext);
        const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

        useEffect(() => {

        }, [dataContext, fetchIntervalSec]);

        return (
            <Component {...props} />
        );
    };
}
