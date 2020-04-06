import pandas as pd
from flask_restful import Resource

class ConfirmedCasesMap(Resource):
    def get(self):
        df = pd.DataFrame(pd.read_csv('data/daily_report.csv').groupby(['Combined_Key', 'Lat', 'Long_'])['Confirmed'].sum())
        cases = df[ df['Confirmed'] > 0 ]
        return {
            "location": [str(idx[0]) for idx in cases.index],
            "lat": [float(idx[1]) for idx in cases.index],
            "lon": [float(idx[2]) for idx in cases.index],
            "count": [int(cnt) for cnt in cases['Confirmed']],
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
                cases = pd.DataFrame([
                        pd.read_csv(csv_files[i])
                            .drop(['Province/State', 'Country/Region', 'Lat', 'Long'], axis=1)
                            .sum(axis=0)]).T
            else:
                df = pd.read_csv(csv_files[i])
                cases = pd.DataFrame(df[ df['Country/Region'] == country ]
                              .drop(['Province/State', 'Country/Region', 'Lat', 'Long'], axis=1)
                              .sum(axis=0))
            stats['{0}_count'.format(categories[i])] = [int(cnt) for cnt in cases[cases.columns[0]]]
        stats['date'] = [str(date) for date in cases.index]
        return stats

class AllCases(Resource):
    def get(self):
        stats = {}
        categories = ['confirmed', 'deaths', 'recovered', 'active']
        columns = ['Confirmed', 'Deaths', 'Recovered', 'Active']
        df = pd.read_csv('data/daily_report.csv')
        for i in range(len(categories)):
            cases = df.loc[:, ['Country_Region', columns[i]]].groupby('Country_Region').sum().sort_values(columns[i], ascending=False)
            stats["countries_{0}".format(categories[i])] = [str(country) for country in cases.index]
            stats["{0}".format(categories[i])] = [int(count) for count in cases[columns[i]]]
            stats["total_{0}".format(categories[i])] = int(cases[columns[i]].sum())
        return stats

class CasesByCountry(Resource):
    def get(self, country):
        columns = ['Confirmed', 'Deaths', 'Recovered', 'Active']
        df = pd.read_csv('data/daily_report.csv')
        if country == 'Global':
            cases = df.loc[:, columns ].sum()
        else:
            cases = df[ df['Country_Region'] == country ].loc[:, columns ].sum()
        return {
            "confirmed": int(cases['Confirmed']),
            "deaths": int(cases['Deaths']),
            "recovered": int(cases['Recovered']),
            "active": int(cases['Active']),
        }

class CountryLatLon(Resource):
    def get(self, country):
        df = pd.read_csv('data/countries.csv')
        df = df[ df['country'] == country ]
        if df.shape[0] > 0:
            return {
                "country": country,
                "lat": float(df['lat']),
                "lon": float(df['lon']),
            }
        else:
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

class USConfirmed(Resource):
    def get(self):
        df = pd.read_csv('data/daily_report.csv')
        df = df[ df['Country_Region'] == 'US'].drop(['FIPS','Admin2','Country_Region','Last_Update','Lat','Long_','Combined_Key'], axis=1)
        df = df[ df['Province_State'] != 'Recovered' ]
        confirmed = pd.DataFrame(df.groupby('Province_State')['Confirmed'].sum().sort_values(ascending=False))
        return {
            "states": [ str(state) for state in confirmed.index ],
            "confirmed": [ int(cnt) for cnt in confirmed['Confirmed'] ],
        }

class USDeaths(Resource):
    def get(self):
        df = pd.read_csv('data/daily_report.csv')
        df = df[ df['Country_Region'] == 'US'].drop(['FIPS','Admin2','Country_Region','Last_Update','Lat','Long_','Combined_Key'], axis=1)
        df = df[ df['Province_State'] != 'Recovered' ]
        deaths = pd.DataFrame(df.groupby('Province_State')['Deaths'].sum().sort_values(ascending=False))
        return {
            "states": [ str(state) for state in deaths.index ],
            "deaths": [ int(cnt) for cnt in deaths['Deaths'] ],
        }

class USBoth(Resource):
    def get(self):
        df = pd.read_csv('data/daily_report.csv')
        df = df[ df['Country_Region'] == 'US'].drop(['FIPS','Admin2','Country_Region','Last_Update','Lat','Long_','Combined_Key'], axis=1)
        df = df[ df['Province_State'] != 'Recovered' ]
        confirmed = pd.DataFrame(df.groupby('Province_State')['Confirmed'].sum().sort_values(ascending=False))
        deaths = pd.DataFrame(df.groupby('Province_State')['Deaths'].sum().sort_values(ascending=False))
        return {
            "states_confirmed": [ str(state) for state in confirmed.index ],
            "confirmed": [ int(cnt) for cnt in confirmed['Confirmed'] ],
            "total_confirmed": int(confirmed['Confirmed'].sum()),
            "states_deaths": [ str(state) for state in deaths.index ],
            "deaths": [ int(cnt) for cnt in deaths['Deaths'] ],
            "total_deaths": int(deaths['Deaths'].sum()),
        }

class USConfirmedTimeSeries(Resource):
    def get(self, state):
        df = pd.read_csv('data/time_series_covid19_confirmed_US.csv')
        df = df[ df['Province_State'] == state ]
        df = pd.DataFrame(df.drop(['UID','iso2','iso3','code3','FIPS','Admin2', 'Province_State','Country_Region','Lat','Long_','Combined_Key'], axis=1).sum())
        df.rename(columns={0: 'Confirmed'}, inplace=True)
        return {
            "confirmed_dates": [ str(dt) for dt in df.index ],
            "confirmed_count": [ int(cnt) for cnt in df['Confirmed'] ]
        }

class USDeathsTimeSeries(Resource):
    def get(self, state):
        df = pd.read_csv('data/time_series_covid19_deaths_US.csv')
        df = df[ df['Province_State'] == state ]
        df = pd.DataFrame(df.drop(['UID','iso2','iso3','code3','FIPS','Admin2', 'Province_State','Country_Region','Lat','Long_','Combined_Key','Population'], axis=1).sum())
        df.rename(columns={0: 'Deaths'}, inplace=True)
        return {
            "deaths_dates": [ str(dt) for dt in df.index ],
            "deaths_count": [ int(cnt) for cnt in df['Deaths'] ]
        }

class USNewConfirmedTimeSeries(Resource):
    def get(self, state):
        df = pd.read_csv('data/time_series_covid19_confirmed_US.csv')
        df = df[ df['Province_State'] == state ]
        df = pd.DataFrame(df.drop(['UID','iso2','iso3','code3','FIPS','Admin2', 'Province_State','Country_Region','Lat','Long_','Combined_Key'], axis=1).sum())
        df = df.diff().fillna(0).rename(columns={0: 'Confirmed'})
        return {
            "confirmed_dates": [ str(dt) for dt in df.index ],
            "confirmed_count": [ int(cnt) for cnt in df['Confirmed'] ]
        }

class USNewDeathsTimeSeries(Resource):
    def get(self, state):
        df = pd.read_csv('data/time_series_covid19_deaths_US.csv')
        df = df[ df['Province_State'] == state ]
        df = pd.DataFrame(df.drop(['UID','iso2','iso3','code3','FIPS','Admin2', 'Province_State','Country_Region','Lat','Long_','Combined_Key','Population'], axis=1).sum())
        df = df.diff().fillna(0).rename(columns={0: 'Deaths'})
        return {
            "deaths_dates": [ str(dt) for dt in df.index ],
            "deaths_count": [ int(cnt) for cnt in df['Deaths'] ]
        }
