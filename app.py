from flask import (
    Flask,
    render_template,
    request,
)
from flask_restful import Resource, Api
from resources.ncov19 import (
    ConfirmedCasesMap,
    GlobalCasesTimeSeries,
    CasesByCountry,
    CountryLatLon,
    AllCountries,
)

app = Flask(__name__)
api = Api(app)

api.add_resource(ConfirmedCasesMap, "/global_confirmed_cases")
api.add_resource(GlobalCasesTimeSeries, "/global_cases_timeseries/<country>")
api.add_resource(CasesByCountry, "/cases_bycountry")
api.add_resource(CountryLatLon, "/country_latlon/<country>")
api.add_resource(AllCountries, "/all_countries")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/new')
def index_nav():
    return render_template("index_nav.html")

if __name__ == '__main__':
    app.run(debug=False)