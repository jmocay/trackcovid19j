var navBar
var newsGrid

window.onload = async () => {
    appConfig.urlPrefix = appConfig.serverUrl[appConfig.env]

    navBar = new NavBar(appConfig)
    navBar.initialize()

    newsGrid = new NewsGrid(appConfig)
    newsGrid.initialize()
}

class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.urlPrefix
    }

    initialize = () => {
        let navCovid19 = document.getElementById('nav-covid19')
        navCovid19.href = encodeURI(`${this.urlPrefix}/news`)
    }
}

class NewsGrid {
    constructor(cfg) {
        this.urlPrefix = cfg.urlPrefix
    }

    initialize = async () => {
        this.createSpinner()
        let articles = await this.getData()
        this.show(articles)
    }

    createSpinner = () => {
        let spinner = document.createElement('div')
        spinner.className = "spinner"
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
            return (text <= n) ? text : text.slice(0, n) + "..."
        }

        const createNewsCard = (article, i) => {
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
            newsDetails.className = "news__details"

            let newsTitle = document.createElement('h2')
            newsTitle.textContent = truncateText(
                article['title'], maxText[className].title
            )
            let newsDescription = document.createElement('p')
            let anchor = document.createElement('a')
            anchor.href = article['url']
            anchor.textContent = truncateText(
                article['description'], maxText[className].description
            )
            newsDescription.append(anchor)

            newsDetails.append(newsTitle)
            newsDetails.append(newsDescription)

            newsCard.append(newsImg)
            newsCard.append(newsDetails)

            return newsCard
        }

        let root = document.getElementById("news-articles")
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
