# trackcovid19j
COVID-19 Dashboard - single page app to help track Novel Corona Virus global spread.


Website URL: http://trackcovid19j.herokuapp.com/


Datasource: https://github.com/CSSEGISandData/COVID-19


REST API endpoints:

http://trackcovid19j.herokuapp.com/all_cases - latest confirmed cases, deaths, recovered for all countries.(space)
http://trackcovid19j.herokuapp.com/all_countries - list of all countries.(space)

http://trackcovid19j.herokuapp.com/cases_bycountry/<country> - latest confirmed cases, deaths, recovered specific to a country.

Example: http://trackcovid19j.herokuapp.com/cases_bycountry/China
  
http://trackcovid19j.herokuapp.com/global_confirmed_cases - latest confirmed cases for all countries with latitude and longitude.

http://trackcovid19j.herokuapp.com//country_latlon/<country> - country latitude and longitude.
  
Example: http://trackcovid19j.herokuapp.com//country_latlon/US
  
http://trackcovid19j.herokuapp.com//global_cases_timeseries/<country> - confirmed cases, deaths, recovered timeseries data by country.


