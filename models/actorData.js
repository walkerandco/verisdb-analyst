"use strict";
////////////////////////////////
// actorData Object Class
/**
 * @author Steven Walker-Roberts
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 */

//////////////////
// import modules

/////////////////////////////
// Define object properties

/**
 * Class for actorData object.
 * @class
 * @memberof vcdbFactory
 * @lends actorData.prototype
 */
class actorData { 

  /**
   * @constructs actorData
   * @param {array} type - Type of actor.
   * @param {array} countries - Array of actor countries.
   * @param {array} countriesCount - Array of frequencies for each country.
   * @param {array} motives - Array of employee numbers.
   * @param {array} motivesCount - Aray of frequencies for each employee count.
   * @param {array} varieties - Array of actor varieties.
   * @param {array} varietiesCount - Array of frequencies for each variety.
   */
  constructor (type, countries, countriesCount, motives, motivesCount, varieties, varietiesCount) {
   /**
    * @property {array) type - Type of actor.
    */
   this.type = type;
   /**
    * @property {object} countries - Data object storing country information.
    */
    this.countries = { country: countries, count: countriesCount };
   /**
    * @property {object} varieties - Data object storing country information.
    */
    this.varieties = { variety: varieties, count: varietiesCount };
    /**
    * @property {object} countries - Data object storing country information.
    */
    this.motives = { motive: motives, count: motivesCount };
    
  } //end of constructor

  //cascaded object create function for actorData (technically a factory)
  /**
   * Alternative copy constructor.
   * @function actorData#createactorData
   * @param {object} object - Contains actorData properties (countries, countriesCount, motive, motiveCount, variety, varietyCount).
   */
 createActorData(object) {
    if(object.type==="actorData"){
      return new actorData(object.type, object.countries, object.countriesCount, object.motive, object.motiveCount, object.variety, object.varietyCount);
    } else { //end of if
      //if type is not actorData, write error to console and return error for handling
      console.log("Error: Invalid Type");
      return -1; 
    } //end of else
  } //end of createactorData method
  
  /**
   * Returns a string representation of object.
   * @function actorData#toString
   * @returns String representation of class.
   */
    toString() {
      return (JSON.stringify(this.object));
    }
} //end of actorDatas class

//////////////////
// export module
module.exports = actorData;