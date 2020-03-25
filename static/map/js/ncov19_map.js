const initMap = async () => {
    const mapDiv = document.getElementById("div-map")

    const ncov19Map = L.map(mapDiv)
    ncov19Map.setView([0, 0], 2)
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const tileLayer = L.tileLayer(
        tileUrl, { attribution }
    )
    tileLayer.addTo(ncov19Map)
    const ncov19Icon = L.icon({
        iconUrl: './static/map/images/corona-red.ico',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [-5, -5],
    });

    try {
        let mapData = await getNCov19MapData()
        
        for (let i = 0; i < mapData['lat'].length; i++) {
            let layer = L.marker(
                [
                    mapData['lat'][i],
                    mapData['lon'][i]
                ],
                { icon: ncov19Icon }
            ).addTo(ncov19Map)
            layer.bindTooltip(`
                City: <b>${mapData['city'][i]}</b><br/>
                Case(s) confirmed: <b>${mapData['count'][i]}</b>
            `).openTooltip()
            layer.bindTooltip(`
                Case(s) confirmed: <b>${mapData['count'][i]}</b>
            `).openTooltip()
            layer.closeTooltip()
        }
    }
    catch (error) {
        let root = document.getElementById("div-map")
        let errmsg = document.createElement("p")
        errmsg.textContent = "Error retrieving chart data."
        root.append(errmsg)
    }
}

const getNCov19MapData = async () => {
    let res = await fetch("http://trackcovid19j.herokuapp.com/global_confirmed_cases", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    let mapData = await res.json()

    return mapData
}

const onLoadingMap = () => {
    console.log('loading...')
    // tbd show spinner
}

const onLoadedMap = () => {
    console.log('done loading.')
    // tbd hide spinner
}