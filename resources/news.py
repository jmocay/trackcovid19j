from flask_restful import Resource
from newsapi import NewsApiClient
from resources.config import AppConfig as cfg

class Headlines(Resource):
    def get(self, topic):
        result = { 'status': 'ok', 'articles': [] }
        news_client = NewsApiClient(api_key=cfg.NEWSAPI_KEY)
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

        for news_source in news_sources:
            response = news_client.get_top_headlines(q=topic, sources=news_source)
            if response['status'] == 'ok':
                for article in response['articles']:
                    result['articles'].append({
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
