# Market Hours  

A REST api to get stock market sessions opening hours and status.

## Introduction

This simple REST api is a simplified and open source version of a service I coded a while ago when in need to get a feed of the stock and financial markets opening hours and status. 

The service run on NodeJS and use a MongoDB database with two simple collections to get all data needed. 

The API returns data taking into account the following:
- the standard market session opening and closing time if any
- pre-market sessions opening and closing time if any
- post-market / after-market sessions opening and closing time if any
- any holidays or special session times for a market / exchange 



## Database Setup
1. Setup a MongoDB instance (see this link if you never installed MongoDB) [https://www.mongodb.com/docs/manual/installation/](https://www.mongodb.com/docs/manual/installation/) or setup a MongoDB instance on MongoDB aura or other provider of your choice.
2. Create a new database named "markethours"
3. Import all data in the data folder of the repository in the database under the "exchanges" and "holidays" collections
4. Get the connection URI to the database

`Note`: the data in the data folder is a work in progress. It is being updated over time so check for updates or contribute to updating, adding data as you wish. A more comprehensive data management solution is in the work.

## Setting up the service
1. Setup your environment with the following variables:
```
PORT=<your chosen port number for run the service>
MONGO_URL=<the URI for your mongodb database (see step 4 of the Database setup)>
```
2. run the start_prod script 
```
npm run start_prod  
```

# API documentation 

The API is very simple and only has 2 endpoints for the moment. One to get a list of all exchanges and their data (opening hours, timezone, country, etc). The other to check the status of exchanges.

## `GET` /api/v1/exchanges

Gets information about the exchange(s) market(s) based on different paramters
### Query Params
- `country`: ISO 3166-2 code for the country of the exchanges
- `tz`: time zone for the exhanges (using tz database format)
- `exchange`: Name or partial name of the exchange (case insensitive)
- `uuid`: database uuid of the exchange
- `is247`: boolean. filters exchanges running 24/7 (true returns only 24/7 exchanges such as crypto exchanges, etc.)
- `limit`: max number of record returned by the call 
- `skip`: number of records to skip in the query (for pagination)  

### Response format 
Status `200`  
```JSON
{
    "status": 200, //response status 
    "message": "Exchanges data", //system message for the responses
    "skipped": 0, //number of records skipped
    "recCount": 3, //number of records returned 
    "nextSkip": null, // skip value for the next record (for pagination) - null indicates there are no more records after this set
    "totalRecCount": 3, //total number of records corresponding to the query without pagination
    "data": [
        {
            "name": "NYSE",    //Name of the exchange
            "countryISO": "US",     //ISO 3166-2 code for the country of the exchange,
            "tz": "America/New_York",    //time zone for the exhanges (using tz database format)
            "is247": false,    //boolean. indicates whether the exchange runs 24/7 (true returns only 24/7 exchanges such as crypto exchanges, etc.)
            "uuid": "6535de14-8724-4302-a4cf-11c28fe93471",    //database unique identifier for the exchange
            "hasPreMarket": true,    //boolean - define if the exchange has pre-market sessions
            "hasAftMarket": true,    //boolean - define if the exchange has after-market/ post-market sessions
            "ohour": 9,    //Number- Standard session opening hour 
            "omin": 30,     //Number- Standard session opening minute 
            "chour": 16,     //Number- Standard session closing hour 
            "cmin":0,     //Number- Standard session closing min          
            "preOhour": 4,     //Number- pre-market session opening hour 
            "preOmin": 0,    //Number- pre-market session opening minute 
            "preChour":9,     //Number- pre-market session closing hour 
            "preCmin":30,     //Number- pre-market session closing min
            "aftOhour":16,     //Number- post-market session opening hour 
            "aftOmin":0,     //Number- post-market session opening minute 
            "aftChour": 20,     //Number- post-market session closing hour 
            "aftCmin":0     //Number- post-market session closing min  
        }        
    ]
}    
```

## `GET` /api/v1/exchanges/status

Gets the status of the exchanges based on parameters

### Query Params
- `country`: ISO 3166-2 code for the country of the exchanges
- `tz`: time zone for the exhanges (using tz database format)
- `exchange`: Name or partial name of the exchange (case insensitive)
- `uuid`: database uuid of the exchange
- `is247`: boolean. filters exchanges running 24/7 (true returns only 24/7 exchanges such as crypto exchanges, etc.)
- `date`: Override the date for the status check. Default is time and date of the call to endpoint.
- `limit`: max number of record returned by the call 
- `skip`: number of records to skip in the query (for pagination)  


### Response format 
Status `200`  


```JSON

    "status": 200, //response status 
    "message": "Exchanges status", //system message for the responses
    "skipped": 0, //number of records skipped
    "recCount": 3, //number of records returned 
    "nextSkip": null, // skip value for the next record (for pagination) - null indicates there are no more records after this set
    "totalRecCount": 3, //total number of records corresponding to the query without pagination
    "data": [
        {
            "exchange": "NASDAQ",  // name of the exchange
            "status": "closed", // status: can be either open, closed, pre-market or post-market
            "nextOpen": 1666013400, // unix timestamp for the next session opening time
            "nextPreOpen": 1665993600 // unix timestamp for the next pre-market session opening time, if any.
        },
        {
            // in the case of markets open 24/7, there are no open or close time (duh!), so these fields are omited. 
            "exchange": "TEST_EX", 
            "status": "open" 
        }
    ]
}
```