import {createChart, ColorType} from 'lightweight-charts';
import React, {useEffect, useRef} from 'react';

interface TradingViewWidgetProps {
    data: any[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = (props) => {
    const {
        data,
        colors: {
            backgroundColor = 'white',
            lineColor = '#2962FF',
            textColor = 'black',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);

    let chart: any = null;

    useEffect(
        () => {
            const handleResize = () => {
                if (chartContainerRef.current && chart) {
                    chart.applyOptions({width: chartContainerRef.current.clientWidth});
                }
            };

            if (chartContainerRef.current) {
                chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: {type: ColorType.Solid, color: backgroundColor},
                        textColor,
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 300,
                });

                chart.timeScale().fitContent();

                const newSeries = chart.addAreaSeries({
                    lineColor,
                    topColor: areaTopColor,
                    bottomColor: areaBottomColor
                });
                newSeries.setData(data);

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);

                    chart.remove();
                };
            }
        },
        [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    );

    return (
        <div className={'mb-48'}
             ref={chartContainerRef}
        />
    );
};
