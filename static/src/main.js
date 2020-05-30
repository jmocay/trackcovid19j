let sideBar
let navBar
let confirmedCasesMap
let casesChart
let casesSummary
let casesDetails

window.onload = async () => {
    sideBar = new Sidebar(appConfig)
    sideBar.initialize()

    navBar = new NavBar(appConfig)
    navBar.initialize()

    casesSummary = new CasesSummary(appConfig)
    casesSummary.initialize()

    casesDetails = new CasesByCountry(appConfig)
    casesDetails.initialize()

    casesChart = new CasesChart(appConfig)
    casesChart.initialize()

    confirmedCasesMap = new ConfirmedCasesMap(appConfig)
    confirmedCasesMap.initialize()

    getLastUpdate()
}

const getLastUpdate = async () => {
    try {
        let url = encodeURI(`${appConfig.serverUrl[appConfig.env]}/last_update`)
        let res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        let asof = await res.json()
        document.querySelector('#last-update').textContent = 'Last Updated on ' + asof['lastUpdate'] + ' (MM/DD/YYYY)'
    }
    catch (err) {
        console.log(err)
    }
}

class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = () => {
        let navCountry = document.querySelector("#navbar-country")
        navCountry.onclick = sideBar.toggleSidebar.bind(sideBar)
        let navNews = document.querySelector("#navbar-news")
        navNews.href = encodeURI(`${this.urlPrefix}/headlines`)
        let navStates = document.querySelector("#navbar-states")
        navStates.href = encodeURI(`${this.urlPrefix}/states`)
    }
}

class Sidebar {

    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
        this.visible = false
    }

    initialize  = async () => {
        let sidebarData = await sideBar.getSidebarData()
        this.show(sidebarData)
    }

    getSidebarData = async (country) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/all_countries`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let sidebarData = await res.json()
            return sidebarData;
        }
        catch (err) {
            console.log(err)
        }
    }

    openSidebar = () => {
        document.querySelector("#sidebar").style.width = "250px";
        document.querySelector("#sidebar").style.zIndex = 1000;
        document.querySelector("#sidebar").scrollTo(0, 0)
        this.visible = true
    }

    closeSidebar = () => {
        document.querySelector("#sidebar").style.width = "0"
        this.visible = false
    }

    toggleSidebar = () => {
        if (this.visible) {
            this.closeSidebar()
        }
        else {
            this.openSidebar()
        }
    }

    sidebarClickedHandler = (country, evt) => {
        confirmedCasesMap.flyTo(country)
        casesChart.update(country)
        casesSummary.update(country)
        this.closeSidebar()
    }

    show = (sidebarData) => {
        let createSidebarItem = (country, root) => {
            let a = document.createElement("a")
            a.textContent = `${country}`
            a.href = "javascript:void(0)"
            a.onclick = this.sidebarClickedHandler.bind(this, country)
            root.append(a)
        }

        let root = document.getElementById('sidebar')
        let a = document.querySelector("#sidebar-closebtn")
        a.onclick = this.closeSidebar.bind(this)

        createSidebarItem('Global', root)

        sidebarData['countries'].forEach((country) => {
            createSidebarItem(country, root)
        })
    }
}

class ConfirmedCasesMap {

    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    getSpinner = () => {
        if (!this.spinner) {
            let spinner = document.createElement('div')
            spinner.classList.add("spinner")
            document.body.appendChild(spinner)
            this.spinner = spinner
        }
        return this.spinner
    }

    initialize = async () => {
        let mapDiv = document.querySelector("#map-div")
        let ccMap = L.map(mapDiv)
        ccMap.addEventListener('load', (evt) => {
            let spinner = this.getSpinner()
            spinner.zIndex = 1000
        })
        ccMap.setView([0, 0], 2)
        let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        let tileLayer = L.tileLayer(
            tileUrl, { attribution }
        )
        tileLayer.addTo(ccMap)
        this.mapDiv = mapDiv
        this.ccMap = ccMap

        let mapData = await this.getData()
        this.show(mapData)
    }

    getData = async () => {
        try {
            let url = encodeURI(`${this.urlPrefix}/global_confirmed_cases`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            let mapData = await res.json()
            return mapData
        }
        catch (err) {
            console.log(err)
        }
    }

    getCountryLatLong = async (country) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/country_latlon/${country}`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            let latLonData = await res.json()
            return latLonData
        }
        catch (err) {
            console.log(err)
        }
    }

    show = (mapData) => {
        const markerStyles = `
            background-color: #FF4500;
            width: 1rem;
            height: 1rem;
            display: block;
            left: 0rem;
            top: 0rem;
            position: relative;
            border-radius: 3rem 3rem 0;
            transform: rotate(45deg);
            border: 1px solid #FFFFFF
        `
        const markerIcon = L.divIcon({
            className: "covid19-icon",
            iconAnchor: [16, 16],
            popupAnchor: [-5, -5],
            html: `<span style="${markerStyles}" />`
        })

        mapData['lat'].forEach((lat, i) => {
            if (mapData['confirmed'][i] >= 10) {
                let layer = L.marker(
                    [
                        lat,
                        mapData['lon'][i]
                    ],
                    { icon: markerIcon }
                ).addTo(this.ccMap)

                if (mapData['deaths'][i] >= 50) {
                    layer.bindTooltip(`
                            Location: <b>${mapData['location'][i]}</b><br>
                            Confirmed Case(s): <b>${mapData['confirmed'][i].toLocaleString()}</b><br>
                            Deaths: <b>${mapData['deaths'][i].toLocaleString()}</b><br>
                        `).openTooltip()
                    layer.closeTooltip()
                }
            }
        })

        let spinner = this.getSpinner()
        spinner.zIndex = -1000

        this.flyTo('Global')
    }

    flyTo = async (country) => {
        if (country == 'Global') {
            this.ccMap.flyTo([0, 0], 1.5)
        }
        else {
            let latLonData = await this.getCountryLatLong(country)
            this.ccMap.flyTo([latLonData.lat, latLonData.lon], 5)
        }
    }
}

class CasesChart {

    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = async () => {
        this.setupChart();
        let country = 'Global'
        let chartData = await this.getData(country)
        this.show(chartData, country)
    }

    update = async (country) => {
        let chartData = await this.getData(country)
        this.show(chartData, country)
    }

    setupChart = () => {
        this.chart = new Chart(document.getElementById('line-chart').getContext('2d'), {
            type: 'line',
            data: {},
            options: {
                responsive: true,
                title: {
                    display: true,
                    fontSize: 24,
                    fontFamily: 'sans-serif',
                    fontStyle: 'bold',
                    fontColor: '#048080',
                },
                layout: {
                    padding: {
                        top: 10, left: 0,
                        bottom: 0, right: 0,
                    }
                },
                legend: {
                    position: 'bottom',
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

    show = (chartData, country) => {
        this.chart.options.title.text = country
        this.chart.data = {
            labels: chartData.date,
            datasets: [
                {
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

        this.chart.update(0)
    }

    getData = async (country) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/global_cases_timeseries/${country}`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let chartData = await res.json()
            chartData.date = chartData.date.map((dateStr) => new Date(dateStr))
            return chartData;
        }
        catch (err) {
            console.log(err)
        }
    }
}

class CasesSummary {

    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = async () => {}

    update = async (country) => {
        let summaryData = await this.getData(country)
        this.show(summaryData)
    }

    getData = async (country) => {
        try {
            let url = encodeURI(`${this.urlPrefix}/cases_bycountry/${country}`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let byCountryData = await res.json()
            return byCountryData;
        }
        catch (err) {
            console.log(err)
        }
    }

    show = (summaryData) => {
        let categories = [ 'confirmed', 'deaths', 'recovered', 'active' ]
        categories.forEach((category) => {
            let a = document.getElementById(`${category}-summary`)
            if (summaryData[category] > 0) {
                a.textContent = `${summaryData[category].toLocaleString()}`
            }
            else {
                a.textContent = "0 or na"
            }
        })
    }
}

class CasesByCountry {

    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = async () => {
        let casesData = await this.getData()
        this.show(casesData)
    }

    getData = async () => {
        try {
            let url = encodeURI(`${this.urlPrefix}/all_cases`)
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            let casesData = await res.json()
            return casesData
        }
        catch (err) {
            console.log(err)
        }
    }

    casesByCountryClickedHandler = (country, evt) => {
        confirmedCasesMap.flyTo(country)
        casesChart.update(country)
        casesSummary.update(country)
        window.scrollTo(0, 0)
    }

    show = (casesData) => {
        let cases = [
            {
                idSummary: 'confirmed-cases-summary',
                idDetails: 'confirmed-cases-details',
                category: 'confirmed',
                label: 'Confirmed',
            },
            {
                idSummary: 'deaths-cases-summary',
                idDetails: 'deaths-cases-details',
                category: 'deaths',
                label: 'Deaths',
            },
            {
                idSummary: 'recovered-cases-summary',
                idDetails: 'recovered-cases-details',
                category: 'recovered',
                label: 'Recovered',
            },
            {
                idSummary: 'active-cases-summary',
                idDetails: 'active-cases-details',
                category: 'active',
                label: 'Active',
            },
        ]

        cases.forEach((item) => {
            let root = document.getElementById(item.idSummary)

            let a = document.createElement("a")
            a.textContent = `${item.label}`
            a.classList.add("cases-by-country-header")
            a.onclick = this.casesByCountryClickedHandler.bind(this, 'Global');
            root.append(a)

            a = document.createElement("a")
            a.textContent = `${casesData['total_' + item.category].toLocaleString()} `
            a.id = `${item.category}-summary`
            a.classList.add("cases-by-country-header")
            a.onclick = this.casesByCountryClickedHandler.bind(this, 'Global');
            root.append(a)

            root = document.getElementById(item.idDetails)
            casesData['countries_' + item.category].forEach((country, i) => {
                a = document.createElement("a")
                a.textContent = `${casesData[item.category][i].toLocaleString().padStart(8, ' ')} ${country}`
                a.classList.add("cases-by-country-item")
                a.onclick = this.casesByCountryClickedHandler.bind(this, country)
                root.append(a)
            })
        })
    }
}
