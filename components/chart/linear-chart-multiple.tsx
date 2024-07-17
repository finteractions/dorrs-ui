import React, {useEffect, useRef} from "react";
import {Chart} from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import NoDataBlock from "@/components/no-data-block";

type DataSet = {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
};

type ChartProps = {
    labels: string[];
    datasets: DataSet[];
};

const LinearChartMultiple: React.FC<ChartProps> = ({
                                                       labels,
                                                       datasets
                                                   }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart<'line', number[], string> | null>(null);

    const hexToRgba = (hex: string, alpha: number) => {
        const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
        return `rgba(${r},${g},${b},${alpha})`;
    };

    const parseDate = (dateString: string): Date => {
        const [month, day, year] = dateString.split('/');
        return new Date(`${year}-${month}-${day}`);
    };

    const getUniqueMonthLabels = (labels: string[]): string[] => {
        const result: string[] = [];

        // Iterate through each label
        labels.forEach((label, index, array) => {
            const currentDate = parseDate(label);
            const prevDate = index > 0 ? parseDate(array[index - 1]) : null;

            if (index === 0 || currentDate.getMonth() !== prevDate?.getMonth()) {
                result.push(label);
            } else {
                result.push('');
            }
        });

        const lastLabel = labels[labels.length - 1];
        if (!result.includes(lastLabel)) {
            result.push(lastLabel);
        }

        return result;
    };

    const drawChart = (
        ctx: CanvasRenderingContext2D,
        labels: string[],
        datasets: DataSet[],
    ) => {
        Chart.defaults.font.family = '"PT Serif", serif';
        Chart.register(ChartDataLabels);

        const uniqueLabels = getUniqueMonthLabels(labels);

        return new Chart<'line', number[], string>(ctx, {
            type: 'line',
            data: {
                labels: uniqueLabels,
                datasets: datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: hexToRgba(dataset.backgroundColor, 0.15),
                    borderColor: dataset.borderColor,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.5,
                    borderWidth: 2,
                })),
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
                        display: false,
                    },
                    tooltip: {
                        displayColors: false,
                    },
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            color: isDarkTheme() ? '#ececec' : '#000000',
                        },
                    },
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false,
                        },
                        title: {
                            display: false,
                            text: 'X Axis Title',
                            color: isDarkTheme() ? '#ececec' : '#000000'
                        },
                        ticks: {
                            autoSkip: false,
                            align: 'inner',
                            callback: function (value, index) {
                                return uniqueLabels[index] !== '' ? uniqueLabels[index] : '';
                            },
                            maxRotation: 0,
                            minRotation: 0,
                            color: isDarkTheme() ? '#ececec' : '#000000'
                        }
                    },
                    y: {
                        display: true,
                        position: 'right',
                        grid: {
                            display: false,
                        },
                        title: {
                            display: false,
                            text: 'Y Axis Title',
                            color: isDarkTheme() ? '#ececec' : '#000000'
                        },
                        ticks: {
                            padding: 0,
                            color: isDarkTheme() ? '#ececec' : '#000000'
                        },
                    }
                }
            },
        });
    };

    const isDarkTheme = () => {
        return document.documentElement.classList.contains('dark');
    };

    const handleResize = () => {
        if (chartRef.current) {
            chartRef.current.destroy();

            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                chartRef.current = drawChart(ctx, labels, datasets);
                if (chartRef.current.options.plugins?.legend?.labels) {
                    chartRef.current.options.plugins.legend.labels.color = isDarkTheme() ? '#ececec' : '#000000';
                }
                chartRef.current.update();
            }
        }
    };

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                if (datasets.every(dataset => dataset.data.every(value => value === 0))) {
                    return;
                }

                chartRef.current = drawChart(ctx, labels, datasets);

                window.addEventListener('resize', handleResize);
                window.addEventListener('themeToggle', handleResize);
                handleResize();

                return () => {
                    window.removeEventListener('resize', handleResize);
                    window.removeEventListener('themeToggle', handleResize);
                    chartRef.current?.destroy();
                };
            }
        }
    }, [labels, datasets]);

    return (
        <>
            <div className={'chart mb-4'}
                 style={{
                     display: 'flex',
                     justifyContent: 'center',
                     height: datasets.every(dataset => dataset.data.every(value => value === 0)) ? 'auto' : '320px',
                     width: '100%'
                 }}>
                {datasets.every(dataset => dataset.data.every(value => value === 0)) ? (
                    <NoDataBlock primaryText="No Chart available yet"/>
                ) : (
                    <canvas style={{zIndex: 99999}} ref={canvasRef}></canvas>
                )}
            </div>
        </>
    );
};

export default LinearChartMultiple;
