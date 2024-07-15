import React, {useEffect, useRef} from "react";
import {Chart} from 'chart.js/auto';
import NoDataBlock from "@/components/no-data-block";
import ChartDataLabels from 'chartjs-plugin-datalabels';

type ChartProps = {
    labels: string[];
    data: number[];
    backgroundColors: string[];
    title: string;
    labelName?: string;
    width?: number;
    isLegend?: boolean;
    isDataLabel?: boolean;
};

const DoughnutChart: React.FC<ChartProps> = ({
                                                 labels,
                                                 data,
                                                 backgroundColors,
                                                 title,
                                                 labelName,
                                                 width = 200,
                                                 isLegend = true,
                                                 isDataLabel = false
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
        Chart.register(ChartDataLabels);

        const hexToRgba = (hex: string, alpha: number) => {
            const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
            return `rgba(${r},${g},${b},${alpha})`;
        };

        return new Chart<'doughnut', number[], string>(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: labelName ? ` ${labelName}` : ` Count`,
                        data: data,
                        backgroundColor: backgroundColors.map(s => hexToRgba(s, 1)),
                        borderColor: backgroundColors,
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
                aspectRatio: 1,
                plugins: {
                    datalabels: {
                        display: isDataLabel,
                        formatter: (value, ctx) => {
                            const total = data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value * 100) / total).toFixed(2) + '%';
                            return `${percentage}`;
                        },
                        color: '#fff',
                        backgroundColor: '#404040',
                    },
                    legend: {
                        display: isLegend,
                        position: "right",
                    },
                },
            },
        });
    };

    const isDarkTheme = () => {
        return document.documentElement.classList.contains('dark');
    };

    const handleResize = () => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = drawChart(ctx, labels, data, backgroundColors, labelName, isLegend);
                const isSmallScreen = window.innerWidth < 720;
                chartRef.current.options.plugins!.legend!.position = isSmallScreen ? 'top' : 'right';
                chartRef.current.options.plugins!.legend!.labels!.color = !isDarkTheme() ? '#00000' : '#ececec';
                chartRef.current.update();
            }
        }
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
