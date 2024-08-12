import React, {useContext} from "react";
import {DataContext} from "@/contextes/data-context";
import LoaderBlock from "@/components/loader-block";


export default function layoutWrapper<P extends {}>(
    Component: React.ComponentType<P>
) {
    return function Init(props: P) {
        const dataContext = useContext(DataContext);

        return (
            <>
                {dataContext.userProfile ? (
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
