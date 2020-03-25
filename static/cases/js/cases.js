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
        
        let h2 = root.firstElementChild
        h2.textContent = `${casesData['total_' + item.category]} ${item.label}`

        let i = 0
        casesData['countries_' + item.category].forEach((country) => {
            let btn = document.createElement("button")
            btn.className = `btn-${item.category}-bycountry`
            btn.textContent = `${casesData[item.category][i]} ${country}`
            root.append(btn)
            i++
        })
    })
}
