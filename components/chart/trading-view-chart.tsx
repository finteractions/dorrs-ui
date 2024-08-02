import {createChart, ColorType} from 'lightweight-charts';
import React, {useEffect, useRef} from 'react';

interface TradingViewChartProps {
    data: any[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const TradingViewChart: React.FC<TradingViewChartProps> = (props) => {
    const {
        data,
        colors: {
            backgroundColor = props?.colors?.backgroundColor ?? 'white',
            lineColor = props?.colors?.lineColor ?? '#718494',
            textColor = props?.colors?.textColor ?? '#464056',
            areaTopColor = props?.colors?.areaBottomColor ?? '#d4dadf',
            areaBottomColor = props?.colors?.areaBottomColor ?? '#d4dadf',
        } = {},
    } = props;

    console.log(data)

    const chartContainerRef = useRef<HTMLDivElement>(null);

    let chart: any = null;

    const handleResize = () => {
        setTimeout(() => {
            if (chartContainerRef.current && chart) {
                if (window.innerWidth < 1366) {
                    chart.timeScale().applyOptions({
                        timeVisible: false,
                        secondsVisible: false,
                        tickVisible: false,
                        tickMarkFormatter: (time: any, tickMarkType: any, locale: any) => {
                            return '';
                        },
                    });
                } else {
                    chart.timeScale().applyOptions({
                        timeVisible: false,
                        secondsVisible: false,
                        tickVisible: false,
                        tickMarkFormatter: (time: any, tickMarkType: any, locale: any) => {
                            return getTicker(time);
                        },
                    });
                }

                chart.applyOptions({width: chartContainerRef.current.clientWidth});
                chart.timeScale().fitContent();
            }
        }, 150);
    };

    const getTicker = (time: any) => {

        const date = new Date(time * 1000);
        const formattedDate = `${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCDate().toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
        const formattedTime = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
        return `${formattedDate} ${formattedTime}`;
    }

    useEffect(
        () => {
            if (chartContainerRef.current) {
                chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: {
                            type: ColorType.Solid,
                            color: backgroundColor
                        },
                        textColor,
                        fontFamily: '"PT Serif", serif',
                        fontSize: 12
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 300,
                    grid: {
                        horzLines: {
                            color: 'rgba(0, 0, 0, 0)',
                        },
                        vertLines: {
                            color: 'rgba(0, 0, 0, 0)',
                        },
                    },
                    handleScroll: true,
                    handleScale: false,
                });
                chart.timeScale().fitContent();

                const newSeries = chart.addAreaSeries({
                    lineColor,
                    lineWidth: 3,
                    topColor: areaTopColor,
                    bottomColor: areaBottomColor,
                })

                newSeries.setData(data);

                chart.timeScale().applyOptions({
                    timeVisible: false,
                    secondsVisible: false,
                    tickVisible: false,
                    tickMarkFormatter: (time: any, tickMarkType: any, locale: any) => {
                        return getTicker(time);
                    }
                });
                chart.applyOptions({
                    grid: {
                        horzLines: {
                            color: 'rgba(0, 0, 0, 0)',
                        },
                    },
                });

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);

                    chart.remove();
                };
            }
        },
        [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    );

    useEffect(() => {
        window.addEventListener('isPortalShowSidebarMd', handleResize);

        return () => {
            window.removeEventListener('isPortalShowSidebarMd', handleResize);
        };
    }, []);

    return (
        <div className={'mb-48 trading-view-container'}
             ref={chartContainerRef}
        />
    );
};
