let navBar
let barChart
let lineChart
let polarChart
let tabs;
let stateMap;

window.addEventListener('load', async ()=> {
    navBar = new NavBar(appConfig)
    navBar.initialize()

    tabs = new Tabs(appConfig)
    tabs.initialize()

    barChart = new BarChart(appConfig)
    barChart.initialize()

    lineChart = new LineChart(appConfig)
    lineChart.initialize()

    polarChart = new PolarChart(appConfig)
    polarChart.initialize()

    stateMap = new StateMap(appConfig)
    stateMap.initialize()

    let defaultState = 'New York'
    lineChart.update(defaultState)
    polarChart.update(defaultState)
    stateMap.update(defaultState)
})


class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = () => {
        document.querySelector('#nav__home').addEventListener('click', () => {
            window.location = this.urlPrefix
        })
    }
}

class Tabs {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
        this.btnTabs = {
            tab__nav_states: 'tab__states',
            tab__nav_cases: 'tab__cases',
            tab__nav_cases_new: 'tab__new_cases',
            tab__nav_counties: 'tab__counties',
            tab__nav_map: 'tab__map',
        } 
    }

    initialize = () => {
        for (let button of document.querySelector('.tab__nav').querySelectorAll('button')) {
            button.addEventListener('click', this.tabNavClicked)
        }
        this.selectTab('tab__nav_states')
    }

    tabNavClicked = (evt) => {
        this.selectTab(evt.target.id)
    }

    selectTab = (btnId) => {
        // select tab
        for (let tab_content of document.querySelectorAll('.tab__content')) {
            tab_content.style.display = 'none'
        }
        let tab = document.querySelector(`#${this.btnTabs[btnId]}`)
        tab.style.display = 'grid'
        tab.style.gridArea = 'a'
        // activate button for tab
        for (let button of document.querySelector('.tab__nav').querySelectorAll('button')) {
            button.classList.remove('active')
        }
        document.querySelector(`#${btnId}`).classList.add('active')
        if (btnId === 'tab__nav_map') {
            stateMap.updateView()
        }
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
            let canvas = document.querySelector(`.${bchartSetting.canvasClass}`)
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
                                minRotation: 60,
                                maxRotation: 60,
                            },
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
                canvasClass: 'bchart__canvas_confirmed',
                title: `Total Confirmed: ${(chartData.total_confirmed).toLocaleString()}`,
                label: 'Confirmed',
                xLabels: chartData.states_confirmed,
                ys: chartData.confirmed,
                color: 'rgba(255, 69, 0, .5)',
                backgroundColor: 'rgba(255, 69, 0, .5)',
            },
            {
                canvasClass: 'bchart__canvas_deaths',
                title: `Total Deaths: ${(chartData.total_deaths).toLocaleString()}`,
                label: 'Deaths',
                xLabels: chartData.states_deaths,
                ys: chartData.deaths,
                color: 'rgba(255, 0, 0, .5)',
                backgroundColor: 'rgba(255, 69, 0, .5)',
            }
        ]

        bchartSettings.forEach(bchartSetting => {
            this.charts[bchartSetting.canvasClass] = createBarChart({
                ...bchartSetting
            })
            document.querySelector(`.${bchartSetting.canvasClass}`).addEventListener('click', () => {
                let chart = this.charts[bchartSetting.canvasClass]
                if (chart.tooltip._lastActive.length > 0) {
                    let lastTooltipActive = chart.tooltip._lastActive[0]
                    let state = lastTooltipActive._model.label
                    lineChart.update(state)
                    polarChart.update(state)
                    stateMap.update(state)
                    tabs.selectTab('tab__nav_cases')
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
    }

    getData = async (state, chartLine) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/${chartLine.endpoint}/${state}`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let chartData = await res.json()
            chartData[chartLine.xs] = chartData[chartLine.xs].map((dateStr) => new Date(dateStr))
            return chartData;
        }
        catch (err) {
            console.error(err)
        }
    }

    update = async (state) => {
        for (let chartSetting of this.chartSettings) {
            let datasets = []
            let xLabels;
            for (let chartLine of chartSetting.chartLines) {
                let chartData = await this.getData(state, chartLine)
                if (!xLabels) {
                    xLabels = chartData[chartLine.xs]
                }
                datasets.push({
                    label: chartLine.label,
                    data: chartData[chartLine.ys],
                    borderColor: chartLine.borderColor,
                    fill: false,
                })
            }

            this.show(state, xLabels, datasets, chartSetting)
        }
    }

    show = (state, xLabels, datasets, chartSetting) => {
        let chart = chartSetting.chart
        chart.options.title.text = `${state} - ${chartSetting.title}`
        chart.data = {
            labels: xLabels,
            datasets: datasets,
        }
        chart.update(0)
    }

    setup = () => {
        const createLineChart = (chartSetting) => {
            return new Chart(document.querySelector(`.${chartSetting.canvasClass}`).getContext('2d'), {
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
                        display: true,
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

        this.chartSettings = [
            {
                canvasClass: 'lchart__canvas_confirmed',
                title: 'Confirmed Cases',
                color: 'rgba(255, 69, 0, .5)',
                chartLines: [
                    {
                        endpoint: 'us_confirmed_series',
                        xs: 'date',
                        ys: 'cumm_confirmed',
                        label: 'Confirmed',
                        borderColor: 'rgba(255, 69, 0, .5)',
                    },
                ]
            },
            {
                canvasClass: 'lchart__canvas_deaths',
                title: 'Deaths',
                color: 'rgba(255, 0, 0, .5)',
                chartLines: [
                    {
                        endpoint: 'us_deaths_series',
                        xs: 'date',
                        ys: 'cumm_deaths',
                        label: 'Deaths',
                        borderColor: 'rgba(255, 0, 0, .5)',
                    },
                ]
            },
            {
                canvasClass: 'lchart__canvas_confirmed_new',
                title: 'New Confirmed Cases',
                color: 'rgba(255, 69, 0, .5)',
                chartLines: [
                    {
                        endpoint: 'us_new_confirmed_series',
                        xs: 'date',
                        ys: 'new_confirmed',
                        label: 'New Confirmed',
                        borderColor: 'rgba(255, 69, 0, .5)',
                    },
                    {
                        endpoint: 'us_new_confirmed_moving_avg',
                        xs: 'date',
                        ys: 'moving_avg',
                        label: '7-day Moving Average',
                        borderColor: 'rgba(0, 255, 255, .5)',
                    },
                ]
            },
            {
                canvasClass: 'lchart__canvas_deaths_new',
                title: 'New Deaths',
                color: 'rgba(255, 0, 0, .5)',
                chartLines: [
                    {
                        endpoint: 'us_new_deaths_series',
                        xs: 'date',
                        ys: 'new_deaths',
                        label: 'New Deaths',
                        borderColor: 'rgba(255, 0, 0, .5)',
                    },
                    {
                        endpoint: 'us_new_deaths_moving_avg',
                        xs: 'date',
                        ys: 'moving_avg',
                        label: '7-day Moving Average',
                        borderColor: 'rgba(0, 255, 255, .5)',
                    },
                ]
            }
        ]
        this.chartSettings.forEach((chartSetting) => {
            chartSetting['chart'] = createLineChart(chartSetting)
        })
    }
}

class PolarChart {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
        this.charts = []
    }

    initialize = () => {
        this.setup()
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
            return chartData;
        }
        catch (err) {
            console.error(err)
        }
    }

    show = (chartData, chartSetting) => {
        const selectColor = (i) => {
            let colorWheel = [
                'rgba(255, 0, 255, 1)',
                'rgba(0, 0, 255, 1)',
                'rgba(255, 0, 0, 1)',
                'rgba(0, 128, 0, 1)',
                'rgba(255, 165, 0, 1)',
                'rgba(0, 0, 128, 1)',
                'rgba(127, 255, 212, 1)',
                'rgba(255, 69, 0, 1)',
                'rgba(0, 128, 128, 1)',
                'rgba(255, 255, 0, 1)',
                'rgba(128, 128, 0, 1)',
                'rgba(128, 128, 128, 1)',
            ]
            return colorWheel[i % colorWheel.length]
        }

        chartData[chartSetting.xs][0] = `${chartData[chartSetting.xs][0]} - ${chartSetting.label}`

        let chart = chartSetting.chart
        chart.data = {
            datasets: [
                {
                    data: chartData[chartSetting.ys],
                    backgroundColor: chartData[chartSetting.ys].map((y, i) => selectColor(i)),
                },
            ],
            labels: chartData[chartSetting.xs]
        }
        chart.update(0)
    }

    update = (state) => {
        this.selectedState = state
        this.chartSettings.forEach(async (chartSetting) => {
            let chartData = await this.getData(state, chartSetting)
            this.show(chartData, chartSetting)
        })
    }

    setup = () => {
        const createPolarChart = (chartSetting) => {
            return new Chart(document.querySelector(`.${chartSetting.canvasClass}`).getContext('2d'), {
                type: 'polarArea',
                data: {},
                options: {
                    responsive: true,
                    animation: {
                        duration: 0,
                    },
                    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
                    onClick: (evt, data) => {
                        if (data[0]) {
                            let state = polarChart.selectedState
                            let county = data[0]._model.label.replace(/ - Confirmed| - Deaths/gi, '')
                            stateMap.update(state, county)
                            tabs.selectTab('tab__nav_map')
                        }
                    },
                    hover: {
                        onHover: (evt) => {
                            evt.target.style.cursor = 'pointer'
                        }
                    }
                },
            });
        }

        this.chartSettings = [
            {
                canvasClass: 'pchart__canvas_confirmed',
                endpoint: 'us_county_confirmed',
                label: 'Confirmed',
                xs: 'counties',
                ys: 'count',
            },
            {
                canvasClass: 'pchart__canvas_deaths',
                endpoint: 'us_county_deaths',
                label: 'Deaths',
                xs: 'counties',
                ys: 'count',
            },
        ]
        this.chartSettings.forEach((chartSetting) => {
            chartSetting['chart'] = createPolarChart(chartSetting)
        })
    }
}

class StateMap {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = () => {}

    getData = async (state, county) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/state_latlon/${state}`)
            if (county) {
                url = encodeURI(`${this.urlPrefix}/county_latlon/${state}/${county}`)
            }
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let latLon = await res.json()
            return latLon   
        } catch (err) {
            console.error(err)
        }
    }

    update = (state, county) => {
        this.state = state
        this.county = county
        this.updateView(state, county)
    }

    updateView = async () => {
        let latLon = await this.getData(this.state, this.county)
        let zoom = 6
        if (this.county) {
            zoom = 10
        }
        let url = `https://maps.google.com?q=${latLon.lat},${latLon.lon}&z=${zoom}&output=embed`
        document.querySelector('.map__google').setAttribute('src', url)
    }
}
