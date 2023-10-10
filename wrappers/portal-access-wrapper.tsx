import React, { useContext } from "react";
import { DataContext } from "@/contextes/data-context";
import UserPermissionService from "@/services/user/user-permission-service";

export default function portalAccessWrapper<P extends { access?: any }>(
    Component: React.ComponentType<P>,
    componentName: string
) {
    function calculateAccess(dataContext:any, componentName:string) {
        const access = UserPermissionService.getAccessRulesByComponent(
            componentName,
            dataContext.userProfile.access
        );
        return access;
    }

    return function Init(props: Omit<P, 'access'>) {
        const dataContext = useContext(DataContext);
        const access = calculateAccess(dataContext, componentName);

        const finalProps: P = {
            ...props as P,
            access,
        };

        return (
            <>
                {access && access.view && (
                    <Component {...finalProps} />
                )}
            </>
        );
    };
}
