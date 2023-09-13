import React from "react";
import ProfileNav from "./profile-nav";

type ProfileContainerProps = {
    children: React.ReactNode
}

export default function ProfileContainer({ children }: ProfileContainerProps) {
    return (
        <div className="profile section">
            <div className="content__top xs-d-block">
                <div className="content__title">Profile</div>
            </div>
            <div className="profile__container">
                <div className="profile__left">
                    <ProfileNav/>
                </div>
                <div className="profile__right">
                    {children}
                </div>
            </div>
        </div>
    )
}
