"use strict";
///////////////////////////////////////
// VCDB Database Accessor Object Class
/**
 * @author Steven Walker-Roberts (16062582)
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 */

//////////////////
// import modules

//third party modules
/** 
 * @requires MongoClient
 * @external MongoClient
 * @see {@link https://www.npmjs.com/package/mongo-client}
 */
const MongoClient = require('mongodb').MongoClient


/**
 * Class for Data Accessor Object
 * @class
 * @memberof vcdbFactory
 * @lends vcdbDAO.prototype
 */
class vcdbDAO {

  ////////////////////////////////////
  //DAO prototype function definitions

  /**
   * @constructs vcdbDAO
   */
  constructor(url, debug) {
      /** 
       * Defines an empty pool of Redis connections.
       * @property {string} url - Connection URL for MongoDB.
       */
      this.url = url;
      /** 
       * Defines an empty pool of Redis connections.
       * @property {boolean} url - Debug flag.
       */
      this.debug = 1;
    } //end of constructor

  ////////////////////
  // Mongo accessors
  /**
   * Submits a search across the socket.
   * @function vcdbDAO#getData
   * @param {object} query - JSON query to MongoDB.
   * @param {string} dbString - Database name.
   * @param {string} colString - Collection name.
   * @param {function} callback - Callback function.
   * @returns {array} - A json array of mongo documents.
   * @throws A database connection or not found error.
   */
  async getData (query, dbString, colString, callback) {
    try {
      //open mongo connection
      const db = await MongoClient.connect(this.url.replace(/vcdb/gi, dbString));
      console.log((new Date()).toISOString()+" - Connected to MongoDB on: "+this.url.replace(/vcdb/gi, dbString));
      //open mongo collection
      const collection = db.collection(colString);
      //execute query
      var docs = await collection.find(query !== null ? query : {}).toArray();
      console.log((new Date()).toISOString()+" - Retrieved "+docs.length+" results.");
      if(this.debug) console.log("getData");
      if (this.debug) console.log(docs);
      //callback
      if (callback) callback(db, collection, docs);
      //close db
      db.close();
      return docs;
    } catch (e) { //end of try
      console.error(e);
    } //end of catch
  } //end of getData function

  /**
   * Submits a search across the socket.
   * @function vcdbDAO#aggregateData
   * @param {string} dbString - Database name.
   * @param {string} colString - Collection name.
   * @param {object} match - Match query.
   * @param {object} group - Grouping query.
   * @param {object} sort - Sorting query.
   * @param {object} unwind - Unwind query.
   * @param {function} callback - Callback function.
   * @returns {array} - A json array of mongo documents.
   * @throws A database connection or not found error.
   */
  async aggregateData(dbString, colString, match, group, sort, unwind, callback) {
    try {
      //instantiate db connection
      const db = await MongoClient.connect(this.url.replace(/vcdb/gi, dbString));
      console.log((new Date()).toISOString()+" - Connected to MongoDB on: "+this.url.replace(/vcdb/gi, dbString));
      //open mongo collection
      const collection = await db.collection(colString);
      //create query array
      var queryArray = [
        { $match: match },
        { $group: group },
        { $sort: sort }
      ]; //end of declaration
      //candidate breakpoint
      //
      //if unwind command exists, add it to the array
      if(unwind) queryArray.splice(1, 0, {$unwind: unwind});
      //execute aggregation command
      var sample = await collection.aggregate(queryArray).toArray();
      if(this.debug) console.log("aggregateDataDAO");
      if (this.debug) console.log(sample);
      //execute callback
      if (callback) callback(db, collection, sample);
      db.close();
      return sample;
    } catch (e) { //end of try
      console.error(e);
    } //end of catch
  } //end of aggregateData function

} //end of vcdbDAO class

//////////////////
// Export Module
module.exports = (url, debug) => { return new vcdbDAO(url, debug) };