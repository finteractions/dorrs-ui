import React from 'react';
import TickerBlock from "@/components/public-dashboard/ticker";
import SymbolRegistryBlock from "@/components/public-dashboard/symbol-registry";


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
                <SymbolRegistryBlock/>
            </>
        );
    }

}

export default DashboardBlock;
