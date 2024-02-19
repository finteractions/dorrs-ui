import React, {useContext, useEffect, useState} from "react";
import {DataContext} from "@/contextes/data-context";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import Image from "next/image";

const CompanyProfileLogo = () => {
    const context = useContext(DataContext);
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        if (context && context.getSharedData()) {
            const logo = context.getSharedData().logo;
            setLogo(logo ?? "")
        }

    }, [context])

    return (
        <>
            <div className={"logo"}>
                {logo === null ? (
                    <LoaderBlock/>
                ) : (<>
                        {!logo ? (
                            <Image src="/img/no-data.png" width={200} height={200} alt="Bank"/>
                        ) : (
                            <div>
                                <img
                                    src={logo || '/img/no-data.png'}
                                    alt="Your Image"
                                />
                            </div>

                        )}
                    </>

                )}

            </div>
        </>
    );
};

export default CompanyProfileLogo;
