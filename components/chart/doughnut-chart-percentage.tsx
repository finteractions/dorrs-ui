import React, {useEffect, useRef, useState} from "react";
import {Chart, registerables} from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import {getGlobalConfig} from "@/utils/global-config";
import formatterService from "@/services/formatter/formatter-service";

type ChartProps = {
    percentage: number;
};

const DoughnutChartPercentage: React.FC<ChartProps> = ({percentage}) => {
    const PATH = `${getGlobalConfig().host}-theme`;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [theme, setTheme] = useState('');
    const colours = {
        light: {
            text: '#75808a',
            background: '#d4dadf'
        },
        dark: {
            text: '#ececec',
            background: '#575757'
        }
    }

    useEffect(() => {
        const storedTheme = localStorage.getItem(PATH);
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme('light');
        }
    }, [PATH]);

    useEffect(() => {
        const storedTheme = localStorage.getItem(PATH);
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme('light');
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.height = 75;
                canvasRef.current.width = 75;
                Chart.register(...registerables);
                Chart.defaults.font.family = '"PT Serif", serif';


                const data = [percentage, 100 - percentage]
                const backgroundColors = ['#3d7da2', colours[theme as 'light' | 'dark'].background]

                const chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [
                            {
                                data: data,
                                backgroundColor: backgroundColors,
                                borderWidth: 0,
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
                            },
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                enabled: false,
                            },

                            // @ts-ignore
                            customCenterText: {
                                text: `${formatterService.numberFormat(data[0], 0, 0)}%`,
                                color: colours[theme as 'light' | 'dark'].text,
                                font: 'bold 13px Arial',
                            }
                        },
                        cutout: '75%'
                    },
                    plugins: [{
                        id: 'customCenterText',
                        afterDraw: (chart) => {
                            const {ctx, width, height} = chart;
                            // @ts-ignore
                            const text = chart.options.plugins.customCenterText.text;
                            // @ts-ignore
                            const color = chart.options.plugins.customCenterText.color;
                            // @ts-ignore
                            const font = chart.options.plugins.customCenterText.font;

                            ctx.save();
                            ctx.fillStyle = color;
                            ctx.font = font;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(text, width / 2, height / 2);
                            ctx.restore();
                        }
                    }]
                });

                return () => {
                    chart.destroy();
                };
            }
        }
    }, [percentage, theme]);

    return (
        <>
            {theme && (
                <canvas ref={canvasRef}></canvas>
            )}
        </>
    );
};

export default DoughnutChartPercentage;
