import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import {AuthUserContext} from "@/contextes/auth-user-context";
import React from "react";
import LoaderBlock from "@/components/loader-block";
import {AuthAdminContext} from "@/contextes/auth-admin-context";

export default function loginGuard<P extends {}>(
    Component: React.ComponentType<P>
) {
    const excludedPath: Array<string> = ['/', '/email-verification', '/backend/login']

    return function WithLogin(props: P) {
        const router = useRouter();
        const authUserContext = useContext(AuthUserContext);
        const authAdminContext = useContext(AuthAdminContext);
        const [isLoading, setIsLoading] = useState(true);
        const [isRedirected, setIsRedirected] = useState(false);

        useEffect(() => {

            const checkAuth = () => {
                if (authUserContext.isAuthenticated()) {
                    if (!excludedPath.includes(router.pathname) && !isRedirected) {
                        router.push('/profile');
                        setIsRedirected(true);
                    } else {

                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }

            }

            checkAuth();

        }, [authAdminContext, authUserContext, isRedirected, router]);

        return (
            <>
                {isLoading ? (
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
