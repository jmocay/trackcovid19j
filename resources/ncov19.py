import pandas as pd
from datetime import datetime
from flask_restful import Resource

class ConfirmedCasesMap(Resource):
    def get(self):
        df = pd.DataFrame(pd.read_csv('data/daily_report.csv').groupby(['Lat','Long_'])['Confirmed'].sum())
        return {
            "lat": [float(idx[0]) for idx in df.index],
            "lon": [float(idx[1]) for idx in df.index],
            "count": [int(cnt) for cnt in df['Confirmed']],
        }

class GlobalCasesTimeSeries(Resource):
    def get(self):
        categories = ['confirmed', 'deaths', 'recovered']
        csv_files = ['data/time_series_covid19_confirmed_global.csv',
            'data/time_series_covid19_deaths_global.csv',
            'data/time_series_19-covid-Recovered.csv'
        ]
        stats = {}
        for i in range(3):
            df = pd.DataFrame([
                pd.read_csv(csv_files[i])
                    .drop(['Province/State', 'Country/Region', 'Lat', 'Long'], axis=1)
                    .sum(axis=0)]).T
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

class ConfirmedCasesMap_v0(Resource):
    def get(self):
        df = pd.read_csv('data/time_series_19-covid-Confirmed.csv')
        count_asofdate = df.columns[len(df.columns)-1]
        df['Location'] = df['Province/State']
        df['Location'].fillna(df['Country/Region'], inplace=True)
        df[count_asofdate].fillna(0, inplace=True)
        df2 = df.loc[ :, ['Lat', 'Long', 'Location', count_asofdate] ]
        return {
            "city": [str(val) for val in df2['Location']],
            "lat": [float(val) for val in df2['Lat']],
            "lon": [float(val) for val in df2['Long']],
            "count": [int(val) for val in df2[count_asofdate]],

class CasesByCountry_v0(Resource):
    def get(self):
        stats = {}
        categories = ['confirmed', 'deaths', 'recovered']
        csv_files = [
            'data/time_series_19-covid-Confirmed.csv',
            'data/time_series_19-covid-Deaths.csv',
            'data/time_series_19-covid-Recovered.csv'
        ]

        for i in range(len(categories)):
            df = pd.read_csv(csv_files[i])
            country_reg = df.columns[1] # Country/Region column
            asof_date = df.columns[len(df.columns)-1] # last column for time series
            df2 = df.loc[
                :, [country_reg, asof_date]
            ].groupby(country_reg).sum().sort_values(asof_date, ascending=False)
            stats["countries_{0}".format(categories[i])] = [str(country) for country in df2.index]
            stats["{0}".format(categories[i])] = [int(count) for count in df2[asof_date]]
            stats["total_{0}".format(categories[i])] = int(df2[asof_date].sum())

        return stats
