var navBar
var barChart;

window.addEventListener('load', async ()=> {
    navBar = new NavBar(appConfig)
    navBar.initialize()

    barChart = new BarChart(appConfig)
    barChart.initialize(appConfig)

})

class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = () => {
        let navCovid19 = document.getElementById('nav-covid19')
        navCovid19.href = encodeURI(`${this.urlPrefix}/`)
    }
}


class BarChart {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
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

    initialize = async () => {
        let chartData = await this.getData()
        this.show(chartData)
    }

    show = (chartData) => {
        let canvasNames = ['canvas__confirmed', 'canvas__deaths']
        let data = [
            {
                title: `Total Confirmed: ${(chartData.total_confirmed).toLocaleString()}`,
                label: 'Confirmed',
                states: chartData.states_confirmed,
                cases: chartData.confirmed,
                color: 'rgba(255, 69, 0, .5)',
            },
            {
                title: `Total Deaths: ${(chartData.total_deaths).toLocaleString()}`,
                label: 'Deaths',
                states: chartData.states_deaths,
                cases: chartData.deaths,
                color: 'rgba(255, 0, 0, .5)',
            }
        ]

        canvasNames.forEach((canvasName, i) => {
            let canvas = document.querySelector(`.${canvasName}`)
            let chart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: data[i].states,
                    datasets: [
                        {
                            label: data[i].label,
                            data: data[i].cases,
                            backgroundColor: data[i].color,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            fill: false,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: data[i].title,
                        fontSize: 24,
                        fontFamily: 'sans-serif',
                        fontStyle: 'bold',
                        fontColor: data[i].color,
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
                                callback: (xLabel, index, values) => {
                                    return xLabel.toLocaleString()
                                }
                            }
                        }]
                    },
                    legend: {
                        display: false,
                    },
                }
            });
        })

    }
}
