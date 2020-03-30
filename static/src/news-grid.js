var news;
var navBar

window.onload = async () => {
    appConfig.urlPrefix = appConfig.serverUrl[appConfig.env]

    navBar = new NavBar(appConfig)
    navBar.initialize()

    news = new NewsGrid(appConfig)
    news.initialize()
}

class NavBar {
    constructor(cfg) {
        this.urlPrefix = cfg.urlPrefix
    }

    initialize = () => {
        let navCovid19 = document.getElementById('nav-covid19')
        navCovid19.href = `${this.urlPrefix}/new`
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

    getData= async ()=> {
        try {
            let topic = "Corona Virus"
            let url = `${this.urlPrefix}/${topic}`
            let result = await fetch(encodeURI(url), {
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
        const createNewsTile = (article, i) => {
            let className = "card"
            if (i%8 == 0) {
                className = "card card-tall card-wide"
            }
            else if (i%3 == 0) {
                className = "card card-wide"
            }

            let newsTile = document.createElement('div')
            newsTile.className = className
            newsTile.style.backgroundImage = `url(${article['urlToImage']})`

            let a = document.createElement('a')
            a.href = article['url']
            a.textContent = article['title']
            newsTile.append(a)

            return newsTile
        }

        let root = document.getElementById("news-articles")
        if (newsData.status === 'ok') {
            let articles = newsData.articles;
            articles.forEach((article, i) => {
                root.append(createNewsTile(article, i))
            })
            document.body.removeChild(this.spinner)
        }
        else {
            console.log("Failed!")
        }
    }
}
