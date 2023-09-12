import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import ProfileContainer from "../components/profile-container";
import ProfileChangePasswordForm from "../components/profile-change-password-form";


const Profile: NextPageWithLayout = () => {
    return (
        <ProfileChangePasswordForm/>
    )
}

Profile.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <ProfileContainer>
                {page}
            </ProfileContainer>
        </PortalLayout>
    )
}

Profile.layoutName = "PortalLayout"

export default Profile
