import pandas as pd
from datetime import datetime
from flask_restful import Resource, request
import json

class ConfirmedCasesMap(Resource):
    def get(self):
        df = pd.DataFrame(pd.read_csv('data/daily_report.csv').groupby(['Combined_Key', 'Lat', 'Long_'])['Confirmed'].sum())
        df = df[ df['Confirmed'] > 0 ]
        return {
            "location": [str(idx[0]) for idx in df.index],
            "lat": [float(idx[1]) for idx in df.index],
            "lon": [float(idx[2]) for idx in df.index],
            "count": [int(cnt) for cnt in df['Confirmed']],
        }

class GlobalCasesTimeSeries(Resource):
    def get(self, country):         
        categories = ['confirmed', 'deaths', 'recovered']
        csv_files = [
            'data/time_series_covid19_confirmed_global.csv',
            'data/time_series_covid19_deaths_global.csv',
            'data/time_series_covid19_recovered_global.csv'
        ]
        stats = {}
        for i in range(len(categories)):
            if country == 'Global':
                df = pd.DataFrame([
                        pd.read_csv(csv_files[i])
                            .drop(['Province/State', 'Country/Region', 'Lat', 'Long'], axis=1)
                            .sum(axis=0)]).T
            else:
                df = pd.read_csv(csv_files[i])
                df = pd.DataFrame(df[ df['Country/Region'] == country ]
                              .drop(['Province/State', 'Country/Region', 'Lat', 'Long'], axis=1)
                              .sum(axis=0))
            stats['{0}_count'.format(categories[i])] = [int(cnt) for cnt in df[df.columns[0]]]
        stats['date'] = [str(dt) for dt in df.index]
        return stats

class CasesByCountry(Resource):
    def get(self):
        stats = {}
        categories = ['confirmed', 'deaths', 'recovered', 'active']
        columns = ['Confirmed', 'Deaths', 'Recovered', 'Active']

        df = pd.read_csv('data/daily_report.csv')
        for i in range(len(categories)):
            df2 = df.loc[:, ['Country_Region', columns[i]]].groupby('Country_Region').sum().sort_values(columns[i], ascending=False)
            stats["countries_{0}".format(categories[i])] = [str(country) for country in df2.index]
            stats["{0}".format(categories[i])] = [int(count) for count in df2[columns[i]]]
            stats["total_{0}".format(categories[i])] = int(df2[columns[i]].sum())

        return stats

class CountryLatLon(Resource):
    def get(self, country):
        df = pd.read_csv('data/daily_report.csv')
        df = df[ df['Country_Region'] == country ]
        df = pd.DataFrame(df.groupby(['Country_Region'])[ ['Lat', 'Long_'] ].mean())
        return {
            "country": str(country),
            "lat": float(df['Lat']),
            "lon": float(df['Long_']),
        }

class AllCountries(Resource):
    def get(self):
        df = pd.read_csv('data/daily_report.csv')
        df = pd.DataFrame(df.groupby(['Country_Region'])[['Country_Region']].first())
        return {
            "countries": [ str(country) for country in df.index ],
        }