import { useRouter } from "next/router";
import {useContext, useEffect, useRef, useState} from "react";
import React from "react";
import LoaderBlock from "@/components/loader-block";
import { AuthAdminContext } from "@/contextes/auth-admin-context";
import { AuthUserContext } from "@/contextes/auth-user-context";

export default function authAdminGuard<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function WithAuth(props: P) {
        const router = useRouter();
        const authUserContext = useContext(AuthUserContext);
        const authAdminContext = useContext(AuthAdminContext);
        const isRedirecting = useRef(false);
        const [loading, setLoading] = useState(true);
        const [redirectPath, setRedirectPath] = useState<string | null>(null);

        useEffect(() => {
            const checkAuth = () => {
                if (isRedirecting.current) {
                    return;
                }

                if (!authAdminContext.isAuthenticated()) {
                    isRedirecting.current = true;
                    authAdminContext?.clearAuthInfo();

                    const path = authUserContext.isAuthenticated() ? '/dashboard' : '/login';
                    setRedirectPath(path);
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
                    <LoaderBlock />
                </div>
            );
        }

        return <Component {...props} />;
    };
}
