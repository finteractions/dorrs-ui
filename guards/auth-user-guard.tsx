import { useRouter } from "next/router";
import { useContext, useEffect, useRef } from "react";
import { AuthUserContext } from "@/contextes/auth-user-context";
import { AuthAdminContext } from "@/contextes/auth-admin-context";
import React from "react";
import { publicPages } from "@/constants/public-pages";

export default function authUserGuard<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function WithAuth(props: P) {
        const router = useRouter();
        const authUserContext = useContext(AuthUserContext);
        const authAdminContext = useContext(AuthAdminContext);
        const isRedirecting = useRef(false);

        useEffect(() => {
            if (isRedirecting.current) {
                return;
            }

            if (!authUserContext.isAuthenticated() && !publicPages.includes(router.pathname)) {
                isRedirecting.current = true;
                authUserContext?.clearAuthInfo();
                authAdminContext?.clearAuthInfo();
                router.replace('/login').finally(() => {
                    isRedirecting.current = false;
                });
            }
        }, [authUserContext, authAdminContext, router]);

        if (!authUserContext.isAuthenticated() && !publicPages.includes(router.pathname)) {
            return null;
        }

        return <Component {...props} />;
    };
}
