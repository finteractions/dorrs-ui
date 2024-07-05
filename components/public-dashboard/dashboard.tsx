import React from 'react';
import TickerBlock from "@/components/public-dashboard/ticker";


class DashboardBlock extends React.Component {


    constructor(props: {}) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <>
                <TickerBlock/>
            </>
        );
    }

}

export default DashboardBlock;
