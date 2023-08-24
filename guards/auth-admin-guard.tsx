import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import React from "react";
import LoaderBlock from "@/components/loader-block";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import {AuthUserContext} from "@/contextes/auth-user-context";

export default function authAdminGuard<P extends {}>(
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
                if (!authAdminContext.isAuthenticated() && !isRedirected) {
                    const routePath = authUserContext.isAuthenticated() ? '/dashboard' : '/login';
                    router.push(routePath)
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

        }, [authAdminContext, isRedirected, router]);

        return (
            <>
                {isLoading || !authAdminContext.isAuthenticated() ? (
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
