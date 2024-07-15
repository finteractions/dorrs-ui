import React, {useEffect, useRef} from "react";
import {Chart, ChartType, ChartData, ChartOptions} from 'chart.js/auto';
import NoDataBlock from "@/components/no-data-block";

type ChartProps = {
    labels: string[];
    data: number[];
    backgroundColors: string[];
    title: string;
    labelName?: string;
    width?: number;
    isLegend?: boolean;
};

const DoughnutChart: React.FC<ChartProps> = ({
                                                 labels,
                                                 data,
                                                 backgroundColors,
                                                 title,
                                                 labelName,
                                                 width = 200,
                                                 isLegend = true
                                             }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart<'doughnut', number[], string> | null>(null);

    const drawChart = (
        ctx: CanvasRenderingContext2D,
        labels: string[],
        data: number[],
        backgroundColors: string[],
        labelName?: string,
        isLegend: boolean = true
    ) => {
        Chart.defaults.font.family = '"PT Serif", serif';

        return new Chart<'doughnut', number[], string>(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: labelName ? ` ${labelName}` : ` Count`,
                        data: data,
                        backgroundColor: backgroundColors,
                    },
                ],
            },
            options: {
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0,
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: isLegend,
                        position: "right",
                        labels: {
                            padding: 20,
                            color: isDarkTheme() ? '#00000' : '#ececec'
                        },
                    },
                },
            },
        });
    };

    const isDarkTheme = () => {
        return document.documentElement.classList.contains('dark');
    };

    const handleResize = () => {
        setTimeout(() => {
            if (chartRef.current) {
                const isSmallScreen = window.innerWidth < 720;
                chartRef.current.options.plugins!.legend!.position = isSmallScreen ? 'top' : 'right';
                chartRef.current.options.plugins!.legend!.labels!.color = !isDarkTheme() ? '#00000' : '#ececec'
                chartRef.current.update();
            }
        })
    };

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                if (data.every(value => value === 0)) {
                    return;
                }

                chartRef.current = drawChart(ctx, labels, data, backgroundColors, labelName, isLegend);

                window.addEventListener('resize', handleResize);
                window.addEventListener('themeToggle', handleResize);
                setTimeout(handleResize)

                return () => {
                    window.removeEventListener('resize', handleResize);
                    window.removeEventListener('themeToggle', handleResize);
                    chartRef.current?.destroy();
                };
            }
        }
    }, [labels, data, backgroundColors, title, labelName, width]);

    return (
        <>
            {title && (
                <div className="w-100">
                    <div className="content__title mb-4">{title}</div>
                </div>
            )}
            <div className={'chart mb-4'} style={{display: 'flex', justifyContent: 'center'}}>
                {data.every(value => value === 0) ? (
                    <NoDataBlock primaryText="No Chart available yet"/>
                ) : (
                    <canvas width={window.innerWidth < 720 ? width : width * 2} height={width} ref={canvasRef}></canvas>
                )}
            </div>
        </>
    );
};

export default DoughnutChart;
