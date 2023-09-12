import React, { ReactElement,  useContext} from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import ProfileContainer from "../components/profile-container";
import ProfilePersonalDataForm from "../components/profile-personal-data-form";
import {AuthUserContext} from "@/contextes/auth-user-context";
import {DataContext} from "@/contextes/data-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";




const Profile: NextPageWithLayout = () => {
    const authUserContext = useContext(AuthUserContext);
    const authAdminContext = useContext(AuthAdminContext);
    const dataContext = useContext(DataContext);

    const handleLogout = (): void => {
        authUserContext.clearAuthInfo();
        authAdminContext.clearAuthInfo();
        dataContext.clearUserData();
    }

    return (
        <ProfilePersonalDataForm onCallback={() => handleLogout()}/>
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
