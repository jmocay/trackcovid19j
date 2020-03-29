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

app = Flask(__name__)
api = Api(app)

api.add_resource(AllCases, "/all_cases")
api.add_resource(AllCountries, "/all_countries")
api.add_resource(CasesByCountry, "/cases_bycountry/<country>")
api.add_resource(ConfirmedCasesMap, "/global_confirmed_cases")
api.add_resource(CountryLatLon, "/country_latlon/<country>")
api.add_resource(GlobalCasesTimeSeries, "/global_cases_timeseries/<country>")

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=False)