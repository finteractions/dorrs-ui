import {useContext, useEffect, useState} from "react";
import {AuthUserContext} from "@/contextes/auth-user-context";
import React from "react";
import LoaderBlock from "@/components/loader-block";
import {useRouter} from "next/router";

export default function publicGuard<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function WithAuth(props: P) {
        const router = useRouter();
        const authUserContext = useContext(AuthUserContext);
        const [isLoading, setIsLoading] = useState(true);
        const [isRedirected, setIsRedirected] = useState(false);

        useEffect(() => {
            const checkAuth = () => {

                if (!authUserContext.isAuthenticated() && !isRedirected) {
                    setIsRedirected(true);
                    setIsLoading(false);
                } else {
                    setIsRedirected(true);
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
