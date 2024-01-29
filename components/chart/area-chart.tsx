import React, {useEffect, useRef} from "react";
import {Chart} from 'chart.js/auto';
import NoDataBlock from "@/components/no-data-block";

type ChartProps = {
    labels: string[];
    data: number[];
    title: string;
};

const AreaChart: React.FC<ChartProps> = ({labels, data, title}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {

        const resizeHandler = () =>
            setTimeout(() => {
                chart()
            }, 350)
        const chart = () => {
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    Chart.defaults.font.family = '"PT Serif", serif';

                    if (chartRef.current) {
                        chartRef.current.destroy();
                    }

                    labels = labels.length === 1 ? [labels[0], labels[0]] : labels;
                    data = data.length === 1 ? [data[0], data[0]] : data;
                    const maxDataValue = Math.max(...data);

                    chartRef.current = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: 'Count',
                                    data: data,
                                    fill: true,
                                    borderColor: '#718494',
                                    tension: 0.5,
                                    borderWidth: 5,
                                    backgroundColor: '#d4dadf',
                                    pointRadius: 0
                                },
                            ],
                        },
                        options: {
                            layout: {
                                padding: 0
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: title,
                                    align: 'start',
                                    padding: 0,
                                    font: {
                                        size: 19,
                                    },
                                },
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    displayColors: false,
                                },
                            },
                            scales: {
                                x: {
                                    display: false,
                                },
                                y: {
                                    suggestedMin: 0,
                                    suggestedMax: maxDataValue,
                                    display: false,
                                },
                            },
                        },
                    });
                }
            }
        }

        window.addEventListener('resize', resizeHandler);

        resizeHandler();

        return () => {
            window.removeEventListener('resize', resizeHandler);

            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };

    }, []);

    return (
        <>
            <canvas className={data.length > 0 ? '' : 'd-none'} ref={canvasRef}></canvas>
            {data.length === 0 && (
                <div className="no-chart mb-48">
                    <NoDataBlock primaryText={' '} secondaryText="No Chart available yet"/>
                </div>
            )}
        </>


    );
};

export default AreaChart;
