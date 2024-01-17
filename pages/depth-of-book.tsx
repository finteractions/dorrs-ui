import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import DOBBlock from "@/components/dob-block";


const DepthOfBook: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/depth-of-book/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <DOBBlock onCallback={onCallback}/>
            </div>
        </>
    )
}

DepthOfBook.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

DepthOfBook.layoutName = "PortalLayout"

export default DepthOfBook
