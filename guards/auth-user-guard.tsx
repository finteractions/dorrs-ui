import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import {AuthUserContext} from "@/contextes/auth-user-context";
import React from "react";
import LoaderBlock from "@/components/loader-block";
import {AuthAdminContext} from "@/contextes/auth-admin-context";

export default function authUserGuard<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function WithAuth(props: P) {
        const router = useRouter();
        const authUserContext = useContext(AuthUserContext);
        const authAdminContext = useContext(AuthAdminContext);
        const [isLoading, setIsLoading] = useState(true);
        const [isRedirected, setIsRedirected] = useState(false);

        useEffect(() => {

            const checkAuth = () => {
                if (!authUserContext.isAuthenticated() && !isRedirected) {
                    router.push("/login")
                    authUserContext?.clearAuthInfo();
                    authAdminContext?.clearAuthInfo();
                    setIsRedirected(true);
                } else {
                    setIsLoading(false);
                }
            }

            checkAuth();

            const interval = setInterval(checkAuth, 1000);

            return () => {
                clearInterval(interval);
            };

        }, [authUserContext, isRedirected, router]);

        return (
            <>
                {isLoading || !authUserContext.isAuthenticated() ? (
                   <div className="pre-loader">
                       <LoaderBlock/>
                   </div>
                ) : (
                    <Component {...props} />
                )}

            </>
        );
    };
}
