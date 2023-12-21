import React, {useEffect, useRef} from "react";
import {Chart} from 'chart.js/auto';

type ChartProps = {
    labels: string[];
    data: number[];
    backgroundColors: string[];
    title: string;
    labelName?: string;
};

const DoughnutChart: React.FC<ChartProps> = ({labels, data, backgroundColors, title, labelName}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = 320;
                Chart.defaults.font.family = '"PT Serif", serif';
                const chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: labelName || ' Count',
                                data: data,
                                backgroundColor: backgroundColors,
                            },
                        ],
                    },
                    options: {
                        layout: {
                            padding: 0
                        },
                        responsive: false,
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
                                display: true,
                                position: "right",
                                maxWidth: 135,
                                labels: {
                                    padding: 20
                                }
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

    return <canvas ref={canvasRef}></canvas>;
};

export default DoughnutChart;
