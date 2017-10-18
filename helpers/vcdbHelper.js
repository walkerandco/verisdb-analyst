"use strict";
///////////////////////////////////////
// VCDB Helper Object Class
/**
 * @author Steven Walker-Roberts (16062582)
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 */

//////////////////
// import modules
/** 
 * @requires jstat
 * @external jstat
 * @see {@link https://www.npmjs.com/package/jstat}
 */
const jstat = require('jstat');
/** 
 * @requires lodash
 * @external lodash
 * @see {@link https://www.npmjs.com/package/lodash}
 */
const _ = require('lodash');
 
/**
 * Class for VCDB Helpers
 * @class
 * @memberof vcdbFactory
 * @lends vcdbHelper.prototype
 */
class vcdbHelper {
  /**
   * @constructs vcdbHelper
   */
  constructor(debug) {
      /** 
       * Defines an empty pool of Redis connections.
       * @property {boolean} url - Debug flag.
       */
      this.debug = debug;
    } //end of constructor

	////////////////////
	// Data Helpers
	/**
	 * Converts currency using values obtained in vcdbFactory.
	 * @function vcdbHelper#convertCurrency
	 * @param {number} item - Value to be converted.
	 * @param {array} currencies - Currencies list.
	 * @returns {number} value - Converted currency valued in USD.
	 */
	 async convertCurrency(item, currencies){
		 for(var i in currencies){
			 if(currencies[i].id === item.currency+"USD"){
				 item.amount *= currencies[i].Rate;
			 } //end of if
		 } //end of for
		 if(this.debug) console.log(convertCurrency);
		 if(this.debug) console.log(item);
		 return item;
	 }
	 
	/**
	 * Orders timeseries data.
	 * @function vcdbHelper#sortTimeSeries
	 * @param {array} time - The array of time to be ordered.
	 * @param {array} values - Value array to be secondarily ordered.
	 * @returns {array} sorted - Sorted timeseries data.
	 */
	 sortTimeSeries(time, values){
		//merge arrays
		var unsorted = _.zip(time, values);
		//sort in ascending order
		var sorted = unsorted.sort(function (a,b){
			if (b[0] === a[0]) {
				return b[0] < a[0] ? 1 : b[0] > a[0] ? -1 : 0;
			} //end of if
			return a[0] - b[0];
		}); //end of sort function
		//separate arrays
		var unzipped = _.unzip(sorted);
		//log and return
		console.log("sortTimeSeries");
		console.log(unzipped);
		return unzipped;
	 }
	
	/**
	 * Calculates and stores the maximum count value and its corresponding key.
	 * @function vcdbHelper#getMax
	 * @param {array} data - Source data.
	 * @param {array} comparator - Comparator array.
	 * @param {string} plural - Plural of property.
	 * @param {string} singular - Property of key.
	 */	
	getMax (data, comparator, plural, singular){
		try {
			if(singular){
				//get max value in data
				data[plural]['highCount'] = jstat.max(comparator);
				//get key for max value
				data[plural]['high'+singular] = data[plural][singular][_.findIndex(comparator, (item)=>(item === data[plural]['highCount']))];
			//will attempt to parse using singular, if no singular, will search 'types'
			} else { //end of if
				//get the max value in data
				data[plural]['highCount'] = jstat.max(comparator);
				//find key for max value
				data[plural]['highType'] = data[plural]['types'][_.findIndex(comparator, (item)=>(item === data[plural]['highCount']))];
			} //end of else
		} catch (e) { //end of try
			console.error(e);
		} //end of catch
	} //end of getMax function
	
	/**
	 * Populates arrays within class instances for returned aggregations from mongo.
	 * @function vcdbHelper#mapArray
	 * @param {array} source - Source of aggregated data from MongoDB.
	 * @param {array} destination - Destination array of sorted aggregation.
	 * @param {string} property - The property to operate on.
	 * @param {string} label - Aggregated data label.
	 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
	 * @throws A parsing error.
	 * @returns {object} - Destination object.
	 */
	mapArray (source, destination, property, label, removeUnknown) {
		try {
			//sort aggregated arrays into sensible order
				source.forEach((val) => {
							destination[property][label].push(val._id);
							destination[property]['count'].push(val['count']);
				}); //end of forEach
			//flatten nested arrays
			if(destination[property][label]){
				destination[property][label] = _.flattenDeep(destination[property][label]);
			} //end of if
			//remove duplicates
			var removed = this.removeDuplicates(destination[property][label], destination[property]['count'], removeUnknown);
			destination[property][label] = removed.keys;
			destination[property]['count'] = removed.values;
			//add statistical analytics
			this.getMax(destination, destination[property]['count'], property, label);
			//log and return
			if(this.debug) console.log("mapArray");
			if(this.debug) console.log(destination);
			return destination;
		} catch (e) { //end of try
			console.error(e);
		} //end of catch
	} //end of mapArray function

	/**
	 * Removes duplicate and extraneous data.
	 * @function vcdbHelper#removeDuplicates
	 * @param {array} sourceKeys - Arrays of keys.
	 * @param {array} sourceVals - Array of values.
	 * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
	 * @returns {object} - An object containing keys and values with duplicates removed.
	 */
	removeDuplicates (sourceKeys, sourceVals, removeUnknown) {
		try{
			//create temporaries
			var obj = {};
			var keyArr = [];
			var valArr = [];
			//iterate array and check for duplicates, add if duplicate
			sourceKeys.forEach((item, i) => {
				if(removeUnknown && (item === "Unknown" || item === "NA") || item === "null") console.log("Unknown key ignored");
				else if(!obj.hasOwnProperty(item)) obj[item] = sourceVals[i];
				else obj[item] += sourceVals[i];
			}); //end of forEach
			//convert object to two arrays
			Object.keys(obj).forEach((key) => {
				keyArr.push(key);
				valArr.push(obj[key]);
			}); //end of forEach
			if(this.debug) console.log("removeDuplicates");
			if(this.debug) console.log({keys: keyArr, values: valArr});
			return {keys: keyArr, values: valArr};
		} catch (e) { //end of try
			console.error(e);
		} //end of catch
	} //end of removeDuplicates function
} //end of vcdbHelper class

//////////////////
// Export Module
module.exports = (debug) => { return new vcdbHelper(debug); };