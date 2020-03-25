const initChart = async () => {
    let chartData = await getChartData()
    populateChart(chartData)
}

const populateChart = async (chartData) => {
    new Chart(document.getElementById('timeseries-canvas').getContext('2d'), {
        type: 'line',
        data: {
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
        },
        options: {
            responsive: true,
            tooltips: {
                callbacks: {
                    title: (arg1, arg2) => {
                        tooltipData = arg1[0]
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

const getChartData = async () => {
    try {
        let res = await fetch("http://localhost:5000/global_cases_timeseries", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
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
