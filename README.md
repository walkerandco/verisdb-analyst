# VERISDB Analyst
An application for realtime visual and interactive analysis of VERISDB incident data. The server uses isomorphic javascript and mongodb to analyse the data at lightning fast speeds. This application provides a web interface which analyses a VERIS dataset in realtime. Updates can be push to the client via sockets which make the application dramatically more flexible than conventional solutions. The primary purpose of this application is to provide a simple specialised tool for analysing incident data. The application starts a webservice which can be accessed via single page web application with a server running in the background, or you can curl requests to it. The application employs the MapReduce design pattern because the focus of this software is to digest the VERISDB incident data in its standard schema and produce summarised incident data for use in the real world. Contributions would be much appreciated.

This was produced as part of a research program at the Manchester Metropolitan University as regards internal threats and the emerging paradigm of zero-trust / unprivileged computer security.

# TODO (est. December 2017)
2. Add unit tests for Travis.
3. Publish to npm.
1. Pull automatic updates from vz-risk/vcdb or on manual request within web interface and re-populate MongoDB.
3. Add command line options handler.
3. Dockerise application and configure to install and populate MongoDB on first run.


**Requires: Node.js 4.0+ and MongoDB 3.4+**

# Usage


```
Example
>node vcdbControllerServer.js mongourl

mongourl: The string you use to connect to your server.
```

# Using the Search Interface
The search interface on the 'Search' tab and the search field in the 'Filter' option on all other tabs receives a MongoDB match query. For clarity, any query which is supplied to $match should work and all relevant MongoDB documentation associated with $match applies to usage of the search fields. It is recommended that the schema at vz-risk/vcdb be consulted for likely search candidates. **Remember to stringify your query**. For example, here are some common candidate queries:

```
Search for all trojans within the "summary" field of an incident report.
{"summary": {"$regex": "trojan"}}

Search all incident reports for those which occurred in 2013 only.
{"timeline.incident.year": 2013}

Search for all incidents where the actor was 'internal'.
{"actor.internal": {"$exists": true}}
```

The graphs will automatically update. Though Chart.js (the graphing dependency) can update in real-time, for large reloads the partial containing the graphs will be reloaded not redrawn. However, the application can receive updates via socket which simply cause a redraw when the server publishes updates.

# Installation

Ensure you are using the most recent versions of Node.JS and MongoDB. Download the joined JSON data file from here: https://github.com/walkerandco/VCDB-JSON-Merged/blob/master/vcdb-complete.json.

Then make sure you have pulled the latest version of this repo by running:
```
git clone https://github.com/walkerandco/verisdb-analyst.git
```

Once you have done this, you should be able to import data into MongoDB by running:
```
mongoimport --db yourdbname --collection yourcollectionname --file vcdb-complete.json --jsonArray
```

Once this is done, run:
```
node vcdbControllerServer.js mongourl
```

A web interface will appear on port 15002, and so the address will be http://yourip:15002/.

# API
Presently, VerisDB Analyst has the following REST endpoints:

GET /
```
/actors - returns actor types
/actors/:type - returns all actor data involving that type
/attacks - returns attack types
/attacks/:type - returns all attack data involving that type
/impacts - returns impact data
/victims - returns victim data
```

POST /
```
/query - POST an object of format {match, group, sort, unwind} in order to receive aggregated data in response.
```

# Contributions and Issues
This repository will be update regularly. Please raise any issues on this GitHub repo, not by direct contact via email etc.
If you wish to make a contribution, simply raise an issue and/or submit a pull request referencing that issue and I will review it fairly promptly.

*Copyright (c) Steven Walker-Roberts 2017*


