var chart

const createChart = () => {
    return new Chart(document.getElementById('timeseries-canvas').getContext('2d'), {
        type: 'line',
        data: {},
        options: {
            responsive: true,
            tooltips: {
                callbacks: {
                    title: (args) => {
                        tooltipData = args[0]
                        return new Date(tooltipData.label).toLocaleDateString()
                    },
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        callback: (xLabel, index, values) => {
                            return xLabel.toLocaleDateString()
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                    }
                }]
            }
        }
    });
}

const initChart = async () => {
    chart = createChart()
    let chartData = await getChartData()
    updateChartData(chartData)
}

const updateChart = async (country) => {
    let chartData = await getChartData(country)
    updateChartData(chartData, country)
}

const updateChartData = async (chartData, country) => {
    chart.title = !country ? 'Global' : country
    chart.data = {
        labels: chartData.date,
        datasets: [{
            label: 'Confirmed',
            data: chartData.confirmed_count,
            borderColor: 'rgba(247, 90, 34, 1)',
            fill: false,
        },
        {
            label: 'Deaths',
            data: chartData.deaths_count,
            borderColor: 'rgba(255, 0, 0, 1)',
            fill: false,
        },
        {
            label: 'Recovered',
            data: chartData.recovered_count,
            borderColor: 'rgba(2, 134, 2, 1)',
            fill: false,
        }
        ]
    }

    chart.update(0)
}

const getChartData = async (country) => {
    try {
        let res = await fetch("http://trackcovid19j.herokuapp.com/global_cases_timeseries", {
            method: 'POST',
            body: JSON.stringify({ 'country': !country ? 'Global' : country }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        let chartData = await res.json()
        let dates = chartData.date.map((val) => new Date(val))
        chartData.date = dates
        return chartData;
    }
    catch (err) {
        console.log(err)
        let root = document.getElementById("chart-div")
        let pEl = document.createElement("p")
        pEl.textContent = "Error retrieving chart data."
        root.append(pEl)
    }
}
