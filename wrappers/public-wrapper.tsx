import React, {useEffect} from "react";
import websocketService from "@/services/websocket/websocket-service";


export default function publicWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {


        useEffect(() => {
            websocketService.initWebSocket();
        }, []);

        return (
            <>
                <Component {...props} />
            </>
        );
    };
}
