import React, {useContext} from "react";
import {DataContext} from "@/contextes/data-context";
import LoaderBlock from "@/components/loader-block";
import {useRouter} from "next/router";
import {publicPages} from "@/constants/public-pages";


export default function layoutWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {
        const router = useRouter();
        const dataContext = useContext(DataContext);
        const show = publicPages.includes(router.pathname) ? true : dataContext.userProfile;

        return (
            <>
                {show ? (
                    <Component {...props} />
                ) : (
                    <div className="pre-loader">
                        <LoaderBlock/>
                    </div>
                )}
            </>
        );
    };
}
