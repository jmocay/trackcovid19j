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
    ConfirmedCasesMap,
    CountryLatLon,
    GlobalCasesTimeSeries,
)
from resources.news import Headlines

app = Flask(__name__)
api = Api(app)

api.add_resource(AllCases, "/all_cases")
api.add_resource(AllCountries, "/all_countries")
api.add_resource(CasesByCountry, "/cases_bycountry/<country>")
api.add_resource(ConfirmedCasesMap, "/global_confirmed_cases")
api.add_resource(CountryLatLon, "/country_latlon/<country>")
api.add_resource(GlobalCasesTimeSeries, "/global_cases_timeseries/<country>")
api.add_resource(Headlines, "/get_headlines/<topic>")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/news')
def index_new():
    return render_template("index_new.html")

@app.route('/headlines')
def news_grid():
    return render_template("covid19_news.html")

if __name__ == '__main__':
    app.run(debug=False)
