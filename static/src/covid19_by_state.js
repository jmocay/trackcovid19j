var navBar
var barChart
var lineChart

window.addEventListener('load', async ()=> {
    navBar = new NavBar(appConfig)
    navBar.initialize()

    barChart = new BarChart(appConfig)
    barChart.initialize()

    lineChart = new LineChart(appConfig)
    lineChart.initialize()
})


class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = () => {
        let navCovid19 = document.querySelector('.nav__covid19')
        navCovid19.href = encodeURI(`${this.urlPrefix}/`)
    }
}

class BarChart {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
        this.charts = {}
    }

    initialize = async () => {
        let chartData = await this.getData()
        this.show(chartData)
    }

    getData = async () => {
        let url = encodeURI(`${this.urlPrefix}/usdata_both`)
        let res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        let usData = await res.json()
        return usData
    }

    show = (chartData) => {
        const createBarChart = (bchartSetting) => {
            let canvas = document.querySelector(`.${bchartSetting.canvas}`)
            return new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: bchartSetting.xLabels,
                    datasets: [
                        {
                            label: bchartSetting.label,
                            data: bchartSetting.ys,
                            backgroundColor: bchartSetting.backgroundColor,
                            hoverBackgroundColor: 'rgba(0, 255, 255, 1)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            fill: true,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    animation: {
                        duration: 0,
                    },
                    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
                    title: {
                        display: true,
                        text: bchartSetting.title,
                        fontSize: 24,
                        fontFamily: 'sans-serif',
                        fontStyle: 'bold',
                        fontColor: bchartSetting.color,
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false,
                                minRotation: 90,
                                maxRotation: 90,
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: (xLabel) => {
                                    return xLabel.toLocaleString()
                                }
                            }
                        }]
                    },
                    legend: {
                        display: false,
                    },
                    hover: {
                        onHover: (evt) => {
                            evt.target.style.cursor = 'pointer'
                        }
                    }
                }
            });
        }

        let bchartSettings = [
            {
                canvas: 'bchart__canvas_confirmed',
                title: `Total Confirmed: ${(chartData.total_confirmed).toLocaleString()}`,
                label: 'Confirmed',
                xLabels: chartData.states_confirmed,
                ys: chartData.confirmed,
                color: 'rgba(255, 69, 0, .5)',
                backgroundColor: 'rgba(255, 69, 0, .5)',
            },
            {
                canvas: 'bchart__canvas_deaths',
                title: `Total Deaths: ${(chartData.total_deaths).toLocaleString()}`,
                label: 'Deaths',
                xLabels: chartData.states_deaths,
                ys: chartData.deaths,
                color: 'rgba(255, 0, 0, .5)',
                backgroundColor: 'rgba(255, 69, 0, .5)',
            }
        ]

        bchartSettings.forEach(bchartSetting => {
            this.charts[bchartSetting.canvas] = createBarChart({
                ...bchartSetting
            })
            document.querySelector(`.${bchartSetting.canvas}`).addEventListener('click', () => {
                let chart = this.charts[bchartSetting.canvas]
                if (chart.tooltip._lastActive.length > 0) {
                    let lastTooltipActive = chart.tooltip._lastActive[0]
                    let state = lastTooltipActive._model.label
                    lineChart.update(state)
                }
            })
        })
    }
}

class LineChart {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
        this.charts = []
    }

    initialize = async () => {
        this.setup()
        let defaultState = 'New York'
        this.update(defaultState)
    }

    getData = async (state, chartSetting) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/${chartSetting.endpoint}/${state}`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let chartData = await res.json()
            chartData[chartSetting.xs] = chartData[chartSetting.xs].map((dateStr) => new Date(dateStr))
            return chartData;
        }
        catch (err) {
            console.log(err)
        }
    }

    update = async (state) => {
        this.chartSettings.forEach(async (chartSetting) => {
            let chartData = await this.getData(state, chartSetting)
            this.show(chartData, state, chartSetting)
        })
    }

    show = (chartData, state, chartSetting) => {
        let chart = chartSetting.chart
        chart.options.title.text = `${state} - ${chartSetting.label}`
        chart.data = {
            labels: chartData[chartSetting.xs],
            datasets: [
                {
                    label: chartSetting.label,
                    data: chartData[chartSetting.ys],
                    borderColor: chartSetting.color,
                    fill: false,
                },
            ]
        }
        chart.update(0)
    }

    setup = () => {
        const createLineChart = (chartSetting) => {
            return new Chart(document.querySelector(`.${chartSetting.canvas}`).getContext('2d'), {
                type: 'line',
                data: {},
                options: {
                    responsive: true,
                    animation: {
                        duration: 0,
                    },
                    title: {
                        display: true,
                        fontSize: 24,
                        fontFamily: 'sans-serif',
                        fontStyle: 'bold',
                        fontColor: chartSetting.color,
                    },
                    layout: {
                        padding: {
                            top: 10, left: 0,
                            bottom: 0, right: 0,
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        callbacks: {
                            title: (args) => {
                                let tooltipData = args[0]
                                return new Date(tooltipData.label).toLocaleDateString()
                            },
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                callback: (xLabel) => {
                                    return xLabel.toLocaleDateString()
                                }
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: false,
                                callback: (yLabel) => {
                                    return yLabel.toLocaleString()
                                }
                            }
                        }]
                    }
                }
            });
        }

        let chartSettings = [
            {
                canvas: 'lchart__canvas_confirmed',
                endpoint: 'us_confirmed_series',
                label: 'Confirmed Cases',
                xs: 'confirmed_dates',
                ys: 'confirmed_count',
                color: 'rgba(255, 69, 0, .5)'
            },
            {
                canvas: 'lchart__canvas_deaths',
                endpoint: 'us_deaths_series',
                label: 'Deaths',
                xs: 'deaths_dates',
                ys: 'deaths_count',
                color: 'rgba(255, 0, 0, .5)'
            },
            {
                canvas: 'lchart__canvas_confirmed_new',
                endpoint: 'us_new_confirmed_series',
                label: 'New Confirmed Cases',
                xs: 'confirmed_dates',
                ys: 'confirmed_count',
                color: 'rgba(255, 69, 0, .5)'
            },
            {
                canvas: 'lchart__canvas_deaths_new',
                endpoint: 'us_new_deaths_series',
                label: 'New Deaths',
                xs: 'deaths_dates',
                ys: 'deaths_count',
                color: 'rgba(255, 0, 0, .5)'
            }
        ]
        this.chartSettings = chartSettings.map((chartSetting) => {
            return {
                ...chartSetting,
                chart: createLineChart(chartSetting)
            }
        })
    }
}