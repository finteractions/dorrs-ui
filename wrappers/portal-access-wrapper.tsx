import React, { useContext } from "react";
import { DataContext } from "@/contextes/data-context";
import UserPermissionService from "@/services/user/user-permission-service";

export default function portalAccessWrapper<P extends { access?: any }>(
    Component: React.ComponentType<P>,
    componentName: string
) {
    return function Init(props: Omit<P, 'access'>) {
        const dataContext = useContext(DataContext);
        const access = UserPermissionService.getAccessRulesByComponent(
            componentName,
            dataContext.userProfile.access
        );

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
