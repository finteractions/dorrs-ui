import {createChart, ColorType, PriceScaleMode, CrosshairMode} from 'lightweight-charts';
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
            backgroundColor = 'white',
            lineColor = '#718494',
            textColor = '#464056',
            areaTopColor = '#d4dadf',
            areaBottomColor = '#d4dadf',
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
                    handleScroll: false,
                    handleScale: false,
                    crosshair: {
                        horzLine: {
                            visible: false,
                        },
                        vertLine: {
                            visible: false,
                        },
                        mode: CrosshairMode.Normal,
                    },
                });
                chart.timeScale().fitContent();

                const newSeries = chart.addAreaSeries({
                    lineColor,
                    lineWidth: 5,
                    topColor: areaTopColor,
                    bottomColor: areaBottomColor,
                })

                const today = new Date();
                const firstPoint = data[0];
                const lastPoint = data[data.length - 1];

                const firstDate = new Date(firstPoint.time);
                const lastDate = new Date(lastPoint.time);

                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                const newDatePoints = [];
                for (let date = new Date(firstDate); date <= lastDate; date.setDate(date.getDate() + 1)) {
                    const dateString = date.toISOString().slice(0, 10); // Форматируем дату в "YYYY-MM-DD"
                    const existingPoint = data.find((point) => point.time === dateString); // Проверяем, есть ли точка с этой датой

                    if (existingPoint) {
                        newDatePoints.push(existingPoint);
                    } else {
                        const previousDate = new Date(date);
                        previousDate.setDate(previousDate.getDate() - 1);
                        const previousDateString = previousDate.toISOString().slice(0, 10);

                        const previousPoint = data.find((point) => point.time === previousDateString);
                        const newValue = previousPoint ? previousPoint.value : 0;

                        newDatePoints.push({ time: dateString, value: newValue });
                    }
                }

                const todayDataPoint = {
                    time: formattedDate,
                    value: lastPoint.value,
                };

                newDatePoints.push(todayDataPoint)

                newSeries.setData(newDatePoints);

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
