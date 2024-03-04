import React, {useEffect, useState} from 'react';
import {TradingViewChart} from "@/components/chart/trading-view-chart";

interface TradingViewChartWrapperProps {
    data: any[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const TradingViewChartWrapper: React.FC<TradingViewChartWrapperProps> = (props) => {

    const [colours, setColours] = useState<any>();

    const light = {
        backgroundColor: 'transparent',
        lineColor: '#718494',
        textColor: '#464056',
        areaTopColor: '#d4dadf',
        areaBottomColor: '#d4dadf',
    }

    const dark = {
        backgroundColor: 'transparent',
        lineColor: '#898989',
        textColor: '#898989',
        areaTopColor: '#767676a8',
        areaBottomColor: '#767676a8',
    }

    const isDarkTheme = () => {
        return document.documentElement.classList.contains('dark');
    }
    const handleColour = () => {
        setColours(isDarkTheme() ? dark : light);
    }

    useEffect(() => {
        handleColour();

        window.addEventListener('themeToggle', handleColour);

        return () => {
            window.removeEventListener('themeToggle', handleColour);
        };
    }, []);

    return (
        <TradingViewChart
            data={props.data}
            colors={colours}
        />
    );
};
