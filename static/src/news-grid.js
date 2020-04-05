var navBar
var newsGrid

window.onload = async () => {
    navBar = new NavBar(appConfig)
    navBar.initialize()

    newsGrid = new NewsGrid(appConfig)
    newsGrid.initialize()
}

class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = () => {
        let navCovid19 = document.getElementById('nav-covid19')
        navCovid19.href = encodeURI(`${this.urlPrefix}/`)
    }
}

class NewsGrid {
    constructor(cfg) {
        this.urlPrefix = cfg.serverUrl[appConfig.env]
    }

    initialize = async () => {
        this.createSpinner()
        let articles = await this.getData()
        this.show(articles)
    }

    createSpinner = () => {
        let spinner = document.createElement('div')
        spinner.classList.add("spinner")
        this.spinner = spinner
        let img = document.createElement('img')
        img.src = "static/images/loading.gif"
        spinner.append(img)
        document.body.appendChild(spinner)
    }

    getData = async () => {
        try {
            let topic = "Corona Virus"
            let url = encodeURI(`${this.urlPrefix}/get_headlines/${topic}`)
            let result = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let newsData = await result.json()
            return newsData
        }
        catch (err) {
            console.log(err)
        }
    }

    show = (newsData) => {
        const maxText = {
            "news__card": {
                title: 40,
                description: 80,
            },
            "news__card news__card_wide": {
                title: 60,
                description: 100,
            },
            "news__card news__card_tall news__card_wide": {
                title: 80,
                description: 320,
            },
        }

        const truncateText = (text, n) => {
            if (text.length <= n) {
                return text
            }

            let i = text.indexOf(' ', n)
            if (i > 0) {
                return text.slice(0, i)
            }
            else {
                return text
            }
        }

        const createNewsCard = (article, i) => {
            const cardClickedHandler = (url, evt) => {
                window.location.assign(url)
            }
            let className = "news__card"

            if (i%8 == 0) {
                className = "news__card news__card_tall news__card_wide"
            }
            else if (i%3 == 0) {
                className = "news__card news__card_wide"
            }

            let newsCard = document.createElement('div')
            newsCard.className = className

            let newsImg = document.createElement('img')
            newsImg.src = article['urlToImage']

            let newsDetails = document.createElement('div')
            newsDetails.classList.add("news__details")

            let newsTitle = document.createElement('h2')
            newsTitle.innerText = truncateText(
                article['title'], maxText[className].title
            )

            let newsDescription = document.createElement('p')
            newsDescription.innerText = truncateText(
                article['description'], maxText[className].description
            )
            newsDetails.append(newsTitle)
            newsDetails.append(newsDescription)

            newsCard.append(newsImg)
            newsCard.append(newsDetails)

            newsCard.onclick = cardClickedHandler.bind(this, article['url'])

            return newsCard
        }

        let root = document.querySelector("#news-articles")
        if (newsData.status === 'ok') {
            let articles = newsData.articles;
            articles.forEach((article, i) => {
                root.append(createNewsCard(article, i))
            })
            document.body.removeChild(this.spinner)
        }
        else {
            console.log("Failed!")
        }
    }
}
