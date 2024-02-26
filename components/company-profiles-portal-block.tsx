import React from 'react';

import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import CompanyProfilesBlock from "@/components/company-profiles-block";

interface CompanyProfilesPortalBlockProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}
class CompanyProfilesPortalBlock extends React.Component<CompanyProfilesPortalBlockProps> {

    render() {
        return (
            <CompanyProfilesBlock {...this.props}  />
        );
    }
}

export default portalAccessWrapper(CompanyProfilesPortalBlock, 'CompanyProfileBlock');
