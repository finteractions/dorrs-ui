import {useRouter} from "next/router";
import {useContext, useEffect, useRef, useState} from "react";
import {AuthUserContext} from "@/contextes/auth-user-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import React from "react";
import {publicPages} from "@/constants/public-pages";
import LoaderBlock from "@/components/loader-block";

export default function authUserGuard<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function WithAuth(props: P) {
        const router = useRouter();
        const authUserContext = useContext(AuthUserContext);
        const authAdminContext = useContext(AuthAdminContext);
        const isRedirecting = useRef(false);
        const [redirectPath, setRedirectPath] = useState<string | null>(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {

            const checkAuth = () => {
                if (isRedirecting.current) {
                    return;
                }
                if (!authUserContext.isAuthenticated() && !publicPages.includes(router.pathname)) {
                    isRedirecting.current = true;
                    authUserContext?.clearAuthInfo();
                    authAdminContext?.clearAuthInfo();

                    setRedirectPath('/login');
                } else {
                    setLoading(false);
                }
            };

            checkAuth();
        }, [authAdminContext, authUserContext]);

        useEffect(() => {
            if (redirectPath) {
                router.push(redirectPath).finally(() => {
                    setLoading(false);
                    isRedirecting.current = false;
                });
            }
        }, [redirectPath, router]);

        if (loading) {
            return (
                <div className="pre-loader">
                    <LoaderBlock/>
                </div>
            );
        }

        return <Component {...props} />;
    };
}
