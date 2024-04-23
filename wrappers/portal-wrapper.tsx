import React, {useContext, useEffect} from "react";
import {DataContext} from "@/contextes/data-context";
import LoaderBlock from "@/components/loader-block";
import websocketService from "@/services/websocket/websocket-service";


export default function portalWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {
        const dataContext = useContext(DataContext);

        useEffect(() => {
            if (!dataContext.userProfileLoading) websocketService.initWebSocket();
        }, [dataContext]);

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
