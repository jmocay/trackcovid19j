const initCases = async () => {
    let casesData = await getCasesData()
    populateCases(casesData)
}

const getCasesData = async () => {
    try {
        let res = await fetch("http://trackcovid19j.herokuapp.com/cases_bycountry", {
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

const bycountry_or_global_handler = (evt) => {
    country = evt.srcElement.value
    updateMapView(country)
    updateChart(country)
}

const populateCases = async (casesData) => {
    let cases = [
        {
            id: 'confirmed-cases',
            category: 'confirmed',
            label: 'Confirmed',
        },
        {
            id: 'death-cases',
            category: 'deaths',
            label: 'Deaths',
        },
        {
            id: 'recovered-cases',
            category: 'recovered',
            label: 'Recovered',
        },
        {
            id: 'active-cases',
            category: 'active',
            label: 'Active',
        },
    ]

    cases.forEach((item) => {
        let root = document.getElementById(item.id)

        let btn = document.createElement("button")
        btn.textContent = `${casesData['total_' + item.category]} ${item.label}`
        btn.className = "div-bycountry-header"
        btn.value = 'Global'
        btn.onclick = bycountry_or_global_handler
        root.append(btn)

        let i = 0
        casesData['countries_' + item.category].forEach((country) => {
            btn = document.createElement("button")
            btn.textContent = `${casesData[item.category][i]} ${country}`
            btn.className = "div-bycountry-button"
            btn.value = country
            btn.onclick = bycountry_or_global_handler
            root.append(btn)
            i++
        })
    })
}
