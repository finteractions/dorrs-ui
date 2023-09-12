import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import UsersBlock from "@/components/backend/users-block";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import {useRouter} from "next/router";
import UserBlock from "@/components/backend/user-block";

const UserManagement: NextPageWithLayout = () => {
    const router = useRouter();
    const {user} = router.query;

    return (
        <>
            {user && !Array.isArray(user) ? (
                <UserBlock user_id={user}/>
            ) : (
                <UsersBlock/>
            )}

        </>
    )
}

UserManagement.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

UserManagement.layoutName = "BackendLayout"

export default UserManagement
