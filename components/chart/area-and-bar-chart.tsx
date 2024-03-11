import React, {useEffect, useRef} from 'react';
import Chart from 'chart.js/auto';
import NoDataBlock from "@/components/no-data-block";

interface AreAndBarChartProps {
    data: any[];
}

const defaultColors = {
    light: {
        backgroundColor: '#8293a16e',
        borderColor: '#718494',
        textColour: '#7E8299',
    },
    dark: {
        backgroundColor: '#767676a8',
        borderColor: '#898989',
        textColour: '#ececec',
    },
};

export const AreaAndBarChart: React.FC<AreAndBarChartProps> = ({data}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart<any> | null>(null);

    const getTicker = (time: any) => {
        const date = new Date(time * 1000);
        const formattedDate = `${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCDate().toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
        const formattedTime = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
        return `${formattedDate} ${formattedTime}`;
    }

    const chart = () => {
        const colours = isDarkTheme() ? defaultColors.dark : defaultColors.light
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');

            if (ctx) {
                Chart.defaults.font.family = '"PT Serif", serif';

                if (chartRef.current) {
                    chartRef.current.destroy();
                }

                const maxVolume = Math.max(...data.map(item => item.volume));
                const maxVolumeScaled = maxVolume * 2;

                chartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(item => getTicker(item.time)),
                        datasets: [{
                            label: 'Volume',
                            data: data.map(item => ({x: getTicker(item.time), y: item.volume})),
                            yAxisID: 'left-y-axis',
                            backgroundColor: colours.backgroundColor,
                        }, {
                            label: 'Price',
                            data: data.map(item => ({x: getTicker(item.time), y: item.price})),
                            yAxisID: 'right-y-axis',
                            borderColor: colours.borderColor,
                            backgroundColor: 'rgba(113, 132, 148, 0.2)',
                            type: 'line',
                            fill: true,
                            tension: 0.5,
                            borderWidth: 4,
                        },],
                    },
                    options: {
                        scales: {
                            x: {
                                display: window.innerWidth >= 768,
                                title: {
                                    display: true,
                                    text: '',
                                },
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: colours.textColour,
                                },
                            },
                            'left-y-axis': {
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Volume',
                                },
                                grid: {
                                    display: false,
                                },
                                ticks: {},
                                suggestedMax: maxVolumeScaled,
                                display: false,
                            },
                            'right-y-axis': {
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Price',
                                    color: colours.textColour
                                },
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: colours.textColour,
                                    callback: (value: number | string) => {
                                        if (typeof value === 'number') {
                                            return value.toFixed(2)
                                        }
                                        return value
                                    }
                                },
                                display: true,
                            }
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                displayColors: false
                            }
                        },

                    },
                });
            }
        }

    }

    const isDarkTheme = () => {
        return document.documentElement.classList.contains('dark');
    };

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            setTimeout(() => {
                chart();
            }, 350);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('themeToggle', handleResize);
        window.addEventListener('isPortalShowSidebarMd', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('themeToggle', handleResize);
            window.removeEventListener('isPortalShowSidebarMd', handleResize);

            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    return (
        <>
            <div className={'mb-48'}>
                <canvas className={data.length > 0 ? '' : 'd-none'} ref={canvasRef}
                        style={{maxHeight: '300px', width: '100%'}}></canvas>
            </div>
            {data.length === 0 && (
                <div className="no-chart mb-48">
                    <NoDataBlock primaryText={' '} secondaryText="No Chart available yet"/>
                </div>
            )}
        </>
    );
};
