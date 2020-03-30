var sideBar;
var confirmedCasesMap
var casesChart
var casesByCountry

appConfig = {
    env: 'DEV',
    serverUrl: {
        DEV: 'http://localhost:5000/',
        PROD: 'http://trackcovid19j.herokuapp.com/',
    },
    urlPrefix: '',
}

window.onload = async () => {
    appConfig.urlPrefix = appConfig.serverUrl[appConfig.env]

    sideBar = new Sidebar(appConfig)
    sideBar.initialize()

    confirmedCasesMap = new ConfirmedCasesMap(appConfig)
    confirmedCasesMap.initialize()

    casesChart = new CasesChart(appConfig)
    casesChart.initialize()

    casesByCountry = new CasesByCountry(appConfig)
    casesByCountry.initialize()

}

const getCasesByCountry = async (country) => {
    try {
        let url = `${appConfig.urlPrefix}/cases_bycountry/${country}`
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

const updateSummaryStats = async (country) => {
    let categories = ['confirmed', 'deaths', 'recovered', 'active']
    try {
        let byCountryData = await getCasesByCountry(country)
        categories.forEach((category) => {
            let a = document.getElementById(`${category}-summary`)
            if (a) {
                if (byCountryData[category] > 0) {
                    a.textContent = `${byCountryData[category]}`                    
                }
                else {
                    a.textContent = "0 or na"
                }
            }
        })
    }
    catch (err) {
        console.log(err)
    }
}

class Sidebar {

    constructor(cfg) {
        this.urlPrefix = cfg.urlPrefix
        this.visible = false
    }

    initialize  = async () => {
        let sidebarData = await sideBar.getSidebarData()
        let navbar = document.getElementById("navbar-country")
        navbar.onclick = this.toggleSidebar.bind(this)
        this.show(sidebarData)
    }

    getSidebarData = async (country) => {
        try {
            let url = `${this.urlPrefix}/all_countries`
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
        document.getElementById("sidebar").style.width = "250px";
        document.getElementById("sidebar").style.zIndex = 1000;
        this.visible = true
    }

    closeSidebar = () => {
        document.getElementById("sidebar").style.width = "0"
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
        updateSummaryStats(country)
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
        let a = document.getElementById("sidebar-closebtn")
        a.onclick = this.closeSidebar.bind(this)
        
        createSidebarItem('Global', root)
        
        sidebarData['countries'].forEach((country) => {
            createSidebarItem(country, root)
        })
    }
}

class ConfirmedCasesMap {

    constructor(cfg) {
        this.urlPrefix = cfg.urlPrefix
    }

    getSpinner = () => {        
        let spinner = document.getElementById("spinner")
        if (spinner === null) {
            spinner = document.createElement('div')
            spinner.id = "spinner"
            spinner.className = "spinner"
            document.getElementById("map-div").append(spinner)
        }
        return spinner
    }

    initialize = async () => {
        let mapDiv = document.getElementById("map-div")
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

        let mapData = await this.getMapData()
        this.show(mapData)
    }

    getMapData = async () => {
        try {
            let res = await fetch(`${this.urlPrefix}/global_confirmed_cases`, {
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
            let url = `${this.urlPrefix}/country_latlon/${country}`
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
        let ncov19Icon = L.icon({
            iconUrl: './static/images/corona-red.ico',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [-5, -5],
        });

        mapData['lat'].forEach((lat, i) => {
            if (mapData['count'][i] >= 20) {
                let layer = L.marker(
                    [
                        lat,
                        mapData['lon'][i]
                    ],
                    { icon: ncov19Icon }
                ).addTo(this.ccMap)

                layer.bindTooltip(`
                        Location: <b>${mapData['location'][i]}</b><br>
                        Case(s) confirmed: <b>${mapData['count'][i]}</b>
                    `).openTooltip()
                layer.closeTooltip()
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
        this.urlPrefix = cfg.urlPrefix
        this.chart = this.create();
    }

    initialize = async () => {
        let country = 'Global'
        let chartData = await this.getData(country)
        this.show(chartData, country)
    }

    update = async (country) => {
        let chartData = await this.getData(country)
        this.show(chartData, country)
    }

    create = () => {
        return new Chart(document.getElementById('line-chart').getContext('2d'), {
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
            let url = `${this.urlPrefix}/global_cases_timeseries/${country}`
            let res = await fetch(url, {
                method: 'GET',
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
        }
    }
}

class CasesByCountry {

    constructor(cfg) {
        this.urlPrefix = cfg.urlPrefix
    }

    initialize = async () => {
        let casesData = await this.getCasesByCountryData()
        this.show(casesData)
    }

    getCasesByCountryData = async () => {
        try {
            let res = await fetch(`${this.urlPrefix}/all_cases`, {
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
        updateSummaryStats(country)
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
            a.className = "cases-by-country-header"
            a.onclick = this.casesByCountryClickedHandler.bind(this, 'Global');
            root.append(a)

            a = document.createElement("a")
            a.textContent = `${casesData['total_' + item.category]} `
            a.id = `${item.category}-summary`
            a.className = "cases-by-country-header"
            a.onclick = this.casesByCountryClickedHandler.bind(this, 'Global');
            root.append(a)

            root = document.getElementById(item.idDetails)
            casesData['countries_' + item.category].forEach((country, i) => {
                a = document.createElement("a")
                a.textContent = `${casesData[item.category][i]} ${country}`
                a.className = "cases-by-country-item"
                a.onclick = this.casesByCountryClickedHandler.bind(this, country)
                root.append(a)
            })
        })
    }
}
