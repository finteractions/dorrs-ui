import React, {useEffect} from "react";
import websocketService from "@/services/websocket/websocket-service";

type PortalLayoutProps = {
    children: React.ReactNode;
};


function WebsocketWrapper({children}: PortalLayoutProps) {

    useEffect(() => {
        websocketService.initWebSocket();

        return () => {
            websocketService.closeWebSocket(false);
        };
    }, []);

    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    );
}


export default WebsocketWrapper;
