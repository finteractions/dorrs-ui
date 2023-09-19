import React, { useEffect } from 'react';
import LoaderBlock from "@/components/loader-block";

const Home = () => {
    useEffect(() => {
        const currentUrl = window.location.href;
        const urlObject = new URL(currentUrl);
        window.location.href = `${urlObject.protocol}//${urlObject.hostname}`;
    }, []);

    return (
        <>
            <div>
                <div className="pre-loader">
                    <LoaderBlock/>
                </div>
            </div>
        </>
    )
};

export default Home;

