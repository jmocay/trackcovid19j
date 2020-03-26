const initMap = async () => {
    const mapDiv = document.getElementById("div-map")

    const ncov19Map = L.map(mapDiv)
    ncov19Map.addEventListener('load', (evt) => {
        let spinnerDiv = document.createElement('div')
        spinnerDiv.className = "map-spinner"
        mapDiv.append(spinnerDiv)
    })
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

            if (mapData['count'][i] >= 20) {
                let layer = L.marker(
                    [
                        mapData['lat'][i],
                        mapData['lon'][i]
                    ],
                    { icon: ncov19Icon }
                ).addTo(ncov19Map)

                layer.bindTooltip(`
                        Location: <b>${mapData['location'][i]}</b><br>
                        Case(s) confirmed: <b>${mapData['count'][i]}</b>
                    `).openTooltip()
                layer.closeTooltip()
            }
        }

        let spinnerDiv = mapDiv.getElementsByClassName('map-spinner')
        mapDiv.removeChild(spinnerDiv)
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
