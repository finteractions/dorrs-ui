import React from "react";
import WeeklyAndMonthlyReportsBlock from "@/components/weekly-and-monthly-reports-block";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";

class WeeklyAndMonthlyReportsPortalBlock extends React.Component {
    render() {
        return (
            <WeeklyAndMonthlyReportsBlock {...this.props} />
        );
    }
}

export default portalAccessWrapper(WeeklyAndMonthlyReportsPortalBlock, 'WeeklyAndMonthlyReportsBlock');
