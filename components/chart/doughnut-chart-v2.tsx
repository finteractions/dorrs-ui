import React, {useEffect, useRef} from "react";
import {Chart} from 'chart.js/auto';
import NoDataBlock from "@/components/no-data-block";

type ChartProps = {
    labels: string[];
    data: number[];
    backgroundColors: string[];
    title: string;
    labelName?: string;
};

const DoughnutChartV2: React.FC<ChartProps> = ({labels, data, backgroundColors, title, labelName}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = 320;
                Chart.defaults.font.family = '"PT Serif", serif';

                if (data.every(value => value === 0)) {
                    return;
                }

                const chart = new Chart(ctx, {
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
                            padding: 0
                        },
                        responsive: false,
                        plugins: {
                            title: {
                                display: false,
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
                                maxWidth: undefined,
                                labels: {
                                    padding: 20
                                }
                            },
                            datalabels: {
                                display: false
                            }
                        },

                    },
                });

                return () => {
                    chart.destroy();
                };
            }
        }
    }, []);


    return (
        <>
            <div className=" w-100">
                <div className="content__title">{title}</div>
            </div>
            <div className={'w-100 chart'}>
                {data.every(value => value === 0) ? (
                    <NoDataBlock primaryText="No Chart available yet"/>
                ) : (
                    <canvas ref={canvasRef}></canvas>
                )}
            </div>

        </>
    );
};

export default DoughnutChartV2;
