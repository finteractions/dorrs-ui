import React, { useEffect, useRef } from "react";
import { Chart } from 'chart.js/auto';

type ChartProps = {
    labels: string[];
    data: number[];
    title: string;
};

const AreaChart: React.FC<ChartProps> = ({ labels, data, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                Chart.defaults.font.family = '"PT Serif", serif';

                const maxDataValue = Math.max(...data);

                const chart = new Chart(ctx, {
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

                return () => {
                    chart.destroy();
                };
            }
        }
    }, []);

    return <canvas ref={canvasRef} ></canvas>;
};

export default AreaChart;
