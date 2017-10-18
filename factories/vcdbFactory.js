"use strict";
///////////////////////////////////////
// VCDB Factory Class
/**
 * @author Steven Walker-Roberts (16062582)
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 */

/////////////////
// Node Modules
/** 
 * @requires https
 * @external https
 * @see {@link https://nodejs.org/api/https.html}
 */
const https = require('https');

//own modules

/** @ignore */
var actorData = require("../models/actorData.js");
/** @ignore */
var attackData = require("../models/attackData.js");
/** @ignore */
var impactData = require("../models/impactData.js");
/** @ignore */
var IncidentSummary = require("../models/incidentSummary.js");
/** @ignore */
var victimData = require("../models/victimData.js");

/**
 * Class for VCDB Factory
 * @class
 * @memberof vcdbControllerServer
 * @lends vcdbFactory.prototype
 */
class vcdbFactory {

  //////////////////////////////////////////
  //Factory prototype function definitions
  /**
   * @constructs vcdbFactory
   */
  constructor(url, debug) {
      /** 
       * Defines an empty pool of Redis connections.
       * @property {boolean} url - Debug flag.
       */
      this.debug = 1;
      /** 
       * Instantiates the vcdbDAO.
       * @property {object} vcdbDAO - VCDB DAO object.
       */
      this.vcdbDAO = require("../daos/vcdbDAO.js")(url, debug);
       /** 
       * Instantiates the vcdbHelper.
       * @property {object} vcdbHelper - VCDB Helper object.
       */
      this.vcdbHelper = require("../helpers/vcdbHelper.js")(debug);
    } //end of constructor
    
  
		////////////////
		// Factories
		/**
		 * Carries out an aggregation query to count a field.
		 * @function vcdbFactory#getCount
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} match - Match query.
		 * @param {string} match - Group query.
		 * @returns {object} - An object containing summarised victim data.
		 */
		async getCount(dbString, colString, match, group) {
			try{
				return await this.vcdbDAO.aggregateData(dbString, colString, (match !== null ? JSON.parse(match) : {}), {_id:{$gt:[group, null]}, count:{$sum:1}}, { _id: 1}); //end of aggregateData function
			} catch(e){ //end of try
				console.log(e);
			} //end of catch
		} //end of getCount function
		
		/**
		 * Helper function to retrieve relevant currency rates from Yahoo API.
		 * @function vcdbFactory#getCurrency
		 * @returns {object} - An object containing currency data.
		 */
		getCurrencies(){
		    return new Promise((resolve, reject) => {
				https.get("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22ZARUSD%22%2C%20%22CADUSD%22%2C%20%22KRWUSD%22%2C%20%22INRUSD%22%2C%20%22CZKUSD%22%2C%20%22THBUSD%22%2C%20%22EURUSD%22%2C%20%22GBPUSD%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=", (res) => {
					var data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						if(this.debug) console.log("getCurrencies");
						if(this.debug) console.log((JSON.parse(data)).query.results.rate);
						resolve((JSON.parse(data)).query.results.rate);
					});
				}).on('error', (e) => {
				    console.error(e);
					reject(e);
				});
			});
		}
		
		/**
		 * Carries out an aggregation query and populates an array.
		 * @function vcdbFactory#mapAggregate
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} match - Match query.
		 * @param {string} group - Group query.
		 * @param {string} sort - Sort query.
		 * @param {string} unwind - Unwind query.
		 * @returns {object} - An object containing summarised victim data.
		 */
		async mapAggregate(dbString, colString, match, group, sort, unwind) {
			try{
				var data = await this.vcdbDAO.aggregateData(dbString, colString, (match !== null ? JSON.parse(match) : {}), { _id : group, count : {$sum : 1} }, sort, unwind);
				if(this.debug)console.log("aggregateData");
				if(this.debug)console.log(data);
				return data;
			} catch(e){ //end of try
				console.log(e);
			} //end of catch
		} //end of mapAggregate function
		
		/**
		 * Gets an aggregated summary object of all object data.
		 * @function vcdbServer#mapObject
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} mAccessor - Filter property.
		 * @param {string} match - Match query.
		 * @param {array} plural - Array of plural property names.
		 * @param {array} singular - Array of singular property names (matches schema).
		 * @param {object} instance - New instance of class to work on.
		 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
		 * @returns {object} - An object containing summarised victim data.
		 * @throws A promise rejection.
		 */
		async mapObject(dbString, colString, mAccessor, match, plural, singular, instance, unwind, removeUnknown) {
			//create promise to avoid infinite loop
			return new Promise(async (resolve, reject) => {
					var result = '';
					//iterate each accessor and add aggregated data to new instance
					for (var i in plural){
						if(unwind && typeof unwind === 'number') unwind = (mAccessor+"."+singular[i]);
						instance = this.vcdbHelper.mapArray(await this.mapAggregate(dbString, colString, match, mAccessor+'.'+singular[i], { count:1 }, unwind), instance, plural[i], singular[i], removeUnknown); //end of mapArray function
						if (removeUnknown){
							var removed = await this.vcdbHelper.removeDuplicates(await instance[plural[i]][singular[i]], await instance[plural[i]]['count'], removeUnknown);
							instance[plural[i]][singular[i]] = removed.keys;
							instance[plural[i]]['count'] = removed.values;
						} //end of if
					} //end of for
					if(this.debug) console.log("mapObject");
					if(this.debug) console.log(instance);
					resolve(instance);
			}); //end of promise
		} //end of mapObject function

		/**
		 * Gets an aggregated summary object of all actor data.
		 * @function vcdbFactory#reduceActorData
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} type - Type of actor data to return.
		 * @param {string} match - Match query to use.
		 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
		 * @returns {object} - An object containing summarised actor data.
		 * @throws Database and parsing errors.
		 */
		//WARNING: THIS FUNCTION IS RATHER HACKY BECAUSE VCDB IS NOT JSON COMPLIANT
		async reduceActorData (dbString, colString, type, match, removeUnknown) {
			try {
				debugger;
				//create contexts
				var plurals = ['countries', 'motives', 'varieties'];
				var singulars = ['country', 'motive', 'variety'];
				//create new instance
				var actorDataSeries = new actorData({internal: 0, external: 0, partner: 0}, [], [], [], [], [], []);
				//ensure type object not undefined
				actorDataSeries[type] = {};
				actorDataSeries[type]['types'] = ['internal','external','partner'];
				//iterate each context object and run aggregation queries
				for(var ind in plurals) {
					actorDataSeries = await this.vcdbHelper.mapArray(await this.mapAggregate(dbString, colString, match, "$actor."+type+"."+singulars[ind], { count:1}, "$actor."+type+"."+singulars[ind]), actorDataSeries, plurals[ind], singulars[ind], removeUnknown);
					//add returned object to type object
					actorDataSeries[type][plurals[ind]] = actorDataSeries[plurals[ind]];
				}//end of for
				//aggregate data to determine type count
				for(var i in actorDataSeries[type]['types']){
					var data = await this.getCount(dbString, colString, match, "$actor."+actorDataSeries[type]['types'][i]);
					actorDataSeries[type][actorDataSeries[type]['types'][i]+'Count'] = (data.length>1 ? data[1].count : 0);
				}//end of for
				//statistical analysis of returned type counts
				var maxArray = [actorDataSeries[type].internalCount, actorDataSeries[type].externalCount, actorDataSeries[type].partnerCount];
				this.vcdbHelper.getMax(actorDataSeries, maxArray, type);
				//log and return
				if(this.debug) console.log("reduceActorData");
				if (this.debug) console.log(actorDataSeries);
				return await actorDataSeries[type];
			} catch (e) { //end of try
				console.error(e);
			} //end of catch
		} //end of reduceActorData function

		/**
		 * Gets an aggregated summary object of all victim data.
		 * @function vcdbFactory#reduceAttackData
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} type - Type to query.
		 * @param {string} match - Match query.
		 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
		 * @returns {object} - An object containing summarised attack data.
		 * @throws A parsing error.
		 */
		async reduceAttackData (dbString, colString, type, match, removeUnknown) {
			try {
				//array of fields to search and populate
				var searchPlurals = ['discoveries', 'assets'];
				var searchSingulars = ['discovery', 'asset'];
				var searchGroupFields = ['$discovery_method', '$asset.assets.variety'];
				var searchUnwindFields = ['$discovery_method', '$asset.assets'];
				//manual type array as VCDB is not JSON compliant
				var types = ['malware', 'hacking', 'social', 'physical', 'misuse', 'error', 'environmental', 'unknown'];
				//get object data for standardised json fields
				var attackDataSeries = await this.mapObject(dbString, colString, '$action.'+type, match, ['varieties', 'vectors'], ['variety', 'vector'], new 	attackData([], [], types, [], [], [], [], [], [], []), 1, removeUnknown).catch((e) => console.error(e));
				//for manual types, iterate recursive count
				for(var i in types) {
					var data = await this.getCount(dbString, colString, match, "$action."+types[i]);
					attackDataSeries.types.count.push(data.length>1 ? data[1].count : 0);
				}//end of for
				//statistical analysis of types
				this.vcdbHelper.getMax(attackDataSeries, attackDataSeries['types']['count'], 'types', 'type');
				//for fields that don't fit workflow, manually populate
				for(var i in searchPlurals){
				await this.vcdbHelper.mapArray(await this.mapAggregate(dbString, colString, match, searchGroupFields[i], { count:1 }, searchUnwindFields[i]),		attackDataSeries, searchPlurals[i], searchSingulars[i], removeUnknown);
				}//end of for
				//log and return
				if(this.debug) console.log("reduceAttackData");
				if(this.debug) console.log(attackDataSeries);
				return attackDataSeries;
			} catch (e) { //end of try
				console.error(e);
			} //end of catch
		} //end of reduceAttackData function
		
		/**
		 * Gets an aggregated summary object of all impact data.
		 * @function vcdbFactory#reduceImpactData
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} match - Match query.
		 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
		 * @returns {object} - An object containing summarised victim data.
		 * @throws A parsing error.
		 */
		async reduceImpactData(dbString, colString, match, removeUnknown){
			//context arrays
			var currencies = await this.getCurrencies();
			var timePlurals = ['days', 'months', 'years'];
			var timeSingulars = ['day', 'month', 'year'];
			var lossPlurals = ['varieties', 'ratings'];
			var lossSingulars = ['variety', 'rating'];
			//get time arrays
			var impactDataSeries = await this.mapObject(dbString, colString, '$timeline.incident', match, timePlurals, timeSingulars, new impactData([], [], [], [], [], [], [], [], [], [], [], []), 0, removeUnknown).catch((e) => console.error(e));
			//attach loss arrays
			await this.mapObject(dbString, colString, '$impact.loss', match, lossPlurals, lossSingulars, impactDataSeries, "$impact.loss", removeUnknown).catch((e) => console.error(e));
			//attach time series loss
			var data = await this.mapAggregate(dbString, colString, match, {_id: {amount: "$impact.loss.amount", year:"$timeline.incident.year", currency:"$impact.iso_currency_code"}}, { "_id.year": 1}, "$impact.loss");
			//filter time series data and add to impactDataSeries
			impactDataSeries['lossesPerYear']['series'] = [];
			impactDataSeries['lossesPerYear']['data'] = [];
			for(var i in data) {
				if(data[i]['_id']['_id'].amount && data[i]['_id']['_id'].year) {
					if(data[i]['_id']['_id']['currency'] && (data[i]['_id']['_id']['currency'] !== 'USD')){//convert currency
						data[i]['_id']['_id'] = await this.vcdbHelper.convertCurrency(data[i]['_id']['_id'], currencies);
					} //end of it
					impactDataSeries['lossesPerYear']['series'].push(data[i]['_id']['_id'].year);
					impactDataSeries['lossesPerYear']['data'].push(data[i]['_id']['_id'].amount);
				} //end of if
			} //end of for
			//order timeseries data
			var timeSeries = this.vcdbHelper.sortTimeSeries(impactDataSeries['lossesPerYear']['series'], impactDataSeries['lossesPerYear']['data']);
			var removedDuplicates = this.vcdbHelper.removeDuplicates(timeSeries[0], timeSeries[1]);
			impactDataSeries['lossesPerYear']['series'] = removedDuplicates.keys;
			impactDataSeries['lossesPerYear']['data'] = removedDuplicates.values;
			//log and return
			if(this.debug) console.log("reduceImpactData");
			if(this.debug) console.log(impactDataSeries);
			return impactDataSeries;
		}
		
		/**
		 * Converts incident data to incident summaries in reply to search queries.
		 * @function vcdbServer#reduceIncidentData
		 * @param {string} req - Search request.
		 * @param {string} dbString - Database name.
		 * @param {string} colString - Collection name.
		 * @returns {array} - A an array of incident summaries.
		 * @throws A parsing error.
		 */
		async reduceIncidentData (req, dbString, colString){
			var data = await this.vcdbDAO.getData(JSON.parse(req), 'VCDB', 'Incidents');
			//create empty incident array
			var incidents = [];
			try{
				//parse object into summary of schema from standard schema
				data.forEach((object) => incidents.push(new IncidentSummary(object.timeline.incident, object.victim.victim_id,  object.discovery_method, Object.keys(object.actor)[0], object.asset.assets.variety, object.victim.industry, object.victim.country[0], object.reference, object.summary)));
				if(this.debug) console.log("reduceIncidentData");
				if (this.debug) console.log(incidents);
				return incidents;
			} catch (e) { //end of try
				console.error(e)
			} //end of catch
		} //end of reduceIncidentData function

		
		/**
		 * Gets an aggregated summary object of all victim data.
		 * @function vcdbFactory#reduceVictimData
		 * @param {string} dbString - Name of database to use.
		 * @param {string} colString - Name of collection to use.
		 * @param {string} match - Match query.
		 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
		 * @returns {object} - An object containing summarised victim data.
		 * @throws A parsing error.
		 */
		async reduceVictimData (dbString, colString, match, removeUnknown) {
			try {
				var victimDataSeries = await this.mapObject(dbString, colString, '$victim', match, ['countries', 'employeeNumbers', 'industries'], ['country', 'employee_count', 'industry'], new victimData([], [], [], [], [], []), 0, removeUnknown).catch((e) => console.error(e));
				if(this.debug) console.log("reduceVictimData");
				if(this.debug) console.log(victimDataSeries);
				return victimDataSeries;
			} catch (e) { //end of try
				console.error(e);
			} //end of catch
		} //end of reduceVictimData function
} //end of vcdbFactory class

//////////////////
// Export Module
module.exports = (debug) => { return new vcdbFactory(debug); };