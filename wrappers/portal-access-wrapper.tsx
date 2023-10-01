import React, { useContext } from "react";
import { DataContext } from "@/contextes/data-context";
import UserPermissionService from "@/services/user/user-permission-service";

export default function portalAccessWrapper<P extends { access?: any }>(
    Component: React.ComponentType<P>
) {
    return function Init(props: Omit<P, 'access'>) {
        const dataContext = useContext(DataContext);
        const access = UserPermissionService.getAccessRulesByComponent(
            Component.name,
            dataContext.userProfile.access
        );

        const finalProps: P = {
            ...props as P,
            access,
        };
        console.log(finalProp, dataContext.userProfile.access)
        return (
            <>
                {access && access.view && (
                    <Component {...finalProps} />
                )}
            </>
        );
    };
}
