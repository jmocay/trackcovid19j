from flask import (
    Flask,
    render_template,
    request,
)
from flask_restful import Resource, Api
from resources.covid19api import (
    AllCases,
    AllCountries,
    CasesByCountry,
    Covid19CasesMap,
    CountryLatLon,
    StateLatLon,
    CountyLatLon,
    GlobalCasesTimeSeries,
    USConfirmed,
    USDeaths,
    USBoth,
    USConfirmedTimeSeries,
    USDeathsTimeSeries,
    USNewConfirmedTimeSeries,
    USNewDeathsTimeSeries,
    USNewConfirmedMovingAvg,
    USNewDeathsMovingAvg,
    USCountiesConfirmed,
    USCountiesDeaths,
)
from resources.news import Headlines

app = Flask(__name__)
api = Api(app)

api.add_resource(AllCases, "/all_cases")
api.add_resource(AllCountries, "/all_countries")
api.add_resource(CasesByCountry, "/cases_bycountry/<country>")
api.add_resource(Covid19CasesMap, "/global_confirmed_cases")
api.add_resource(CountryLatLon, "/country_latlon/<country>")
api.add_resource(StateLatLon, "/state_latlon/<state>")
api.add_resource(CountyLatLon, "/county_latlon/<state>/<county>")
api.add_resource(Headlines, "/get_headlines/<topic>")
api.add_resource(USConfirmed, "/us_confirmed")
api.add_resource(USDeaths, "/us_deaths")
api.add_resource(USBoth, "/usdata_both")
api.add_resource(GlobalCasesTimeSeries, "/global_cases_timeseries/<country>")
api.add_resource(USConfirmedTimeSeries, "/us_confirmed_series/<state>")
api.add_resource(USDeathsTimeSeries, "/us_deaths_series/<state>")
api.add_resource(USNewConfirmedTimeSeries, "/us_new_confirmed_series/<state>")
api.add_resource(USNewDeathsTimeSeries, "/us_new_deaths_series/<state>")
api.add_resource(USNewConfirmedMovingAvg, "/us_new_confirmed_moving_avg/<state>")
api.add_resource(USNewDeathsMovingAvg, "/us_new_deaths_moving_avg/<state>")
api.add_resource(USCountiesConfirmed, "/us_county_confirmed/<state>")
api.add_resource(USCountiesDeaths, "/us_county_deaths/<state>")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/headlines')
def news_grid():
    return render_template("covid19_news.html")

@app.route('/states')
def states_cases():
    return render_template("states_cases.html")

if __name__ == '__main__':
    app.run(debug=False)
