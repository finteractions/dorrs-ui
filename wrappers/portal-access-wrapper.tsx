import React, { useContext, useEffect } from "react";
import { DataContext } from "@/contextes/data-context";
import UserPermissionService from "@/services/user/user-permission-service";

export default function portalAccessWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {
        const dataContext = useContext(DataContext);
        const access = UserPermissionService.getAccessRulesByComponent(Component.name, dataContext.userProfile.access)

        return (

            <>
                {access.view && (
                    <Component {...props} access={access}/>
                )}
            </>
        );
    };
}
