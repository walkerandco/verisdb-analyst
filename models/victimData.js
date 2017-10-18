"use strict";
////////////////////////////////
// victimData Object Class
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
 * Class for victimData object.
 * @class
 * @memberof vcdbFactory
 * @lends victimData.prototype
 */
class victimData { 

  /**
   * @constructs victimData
   * @param {array} countries - Array of victim countries.
   * @param {array} countriesCount - Array of frequencies for each country.
   * @param {array} employeeNumbers - Array of employee numbers.
   * @param {array} employeeNumbersCount - Aray of frequencies for each employee count.
   * @param {array} industries - Array of victim industries.
   * @param {array} industriesCount - Array of frequencies for each industry.
   */
  constructor (countries, countriesCount, employeeNumbers, employeeNumbersCount, industries, industriesCount) {
   /**
    * @property {object} countries - Data object storing country information.
    */
    this.countries = { country: countries, count: countriesCount };
   /**
    * @property {object} industries - Data object storing country information.
    */
    this.industries = { industry: industries, count: industriesCount };
    /**
    * @property {object} countries - Data object storing country information.
    */
    this.employeeNumbers = { employee_count: employeeNumbers, count: employeeNumbersCount };
    
  } //end of constructor

  //cascaded object create function for victimData (technically a factory)
  /**
   * Alternative copy constructor.
   * @function victimData#createvictimData
   * @param {object} object - Contains victimData properties (countries, countriesCount, employeeNumber, employeeNumberCount, industry, industryCount).
   */
 createvictimData(object) {
    if(object.type==="victimData"){
      return new victimData(object.countries, object.countriesCount, object.employeeNumber, object.employeeNumberCount, object.industry, object.industryCount);
    } else { //end of if
      //if type is not victimData, write error to console and return error for handling
      console.log("Error: Invalid Type");
      return -1; 
    } //end of else
  } //end of createvictimData method
  
  /**
   * Returns a string representation of object.
   * @function victimData#toString
   * @returns String representation of class.
   */
    toString() {
      return (JSON.stringify(this.object));
    }
} //end of victimDatas class

//////////////////
// export module
module.exports = victimData;