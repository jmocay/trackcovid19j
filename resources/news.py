from os import path
from datetime import datetime, timedelta
from math import floor
import json
from flask_restful import Resource
from newsapi import NewsApiClient
from resources.config import AppConfig as cfg

class Headlines(Resource):
    def get_articles_news_sources(self, topic):
        result = { 'status': 'ok', 'articles': [] }
        news_client = NewsApiClient(api_key=cfg.NEWSAPI_KEY)
        if cfg.ENV == 'DEV':
            news_sources = [
                'abc-news',
                'cbs-news',
                'cnn',
                'cnbc',
                'msnbc',
                'nbc-news',
                'google-news',
                'bbc-news',
                'time',
                'usa-today',
                'xinhua-net'
            ]
        else: # limit news sources for now
            news_sources = [
                'cnn',
                'nbc-news',
                'bbc-news',
            ]

        articles = result['articles']
        for news_source in news_sources:
            response = news_client.get_top_headlines(q=topic, sources=news_source)
            if response['status'] == 'ok':
                for article in response['articles']:
                    articles.append({
                        'source': article['source']['name'],
                        'author': article['author'],
                        'title': article['title'],
                        'description': article['description'],
                        'url': article['url'],
                        'urlToImage': article['urlToImage'],
                        'publishedAt': article['publishedAt'],
                    })
            else:
                result['status'] = 'error'
        return result

    def get(self, topic):
        news_file = 'data/news_articles.json'
        if not path.exists(news_file) or (
            datetime.now() - datetime.fromtimestamp(
                floor(
                    path.getmtime(news_file)
                )
            )
        ).seconds > cfg.NEWSFILE_REFRESH_TIME*3600:
            result = self.get_articles_news_sources(topic)
            with open(news_file, 'w') as news_articles:
                news_articles.write(json.dumps(result['articles']))
            return result
        else:
            result = { 'status': 'ok' }
            with open('data/news_articles.json') as news_articles:
                articles = json.loads(news_articles.read())
                result['articles'] = articles
                return result
