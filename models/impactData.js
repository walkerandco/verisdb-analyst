"use strict";
////////////////////////////////
// impactData Object Class
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
 * Class for impactData object.
 * @class
 * @memberof vcdbFactory
 * @lends impactData.prototype
 */
class impactData { 

  /**
   * @constructs impactData
   * @param {array} type - Type of impact.
   * @param {array} days - Array of impact days.
   * @param {array} daysCount - Array of frequencies for each day.
   * @param {array} years - Array of employee numbers.
   * @param {array} yearsCount - Aray of frequencies for each employee count.
   * @param {array} months - Array of impact months.
   * @param {array} monthsCount - Array of frequencies for each month.
   * @param {array} ratings - Array of impact ratings.
   * @param {array} ratingsCount - Array of frequencies for each rating.
   * @param {array} varieties - Array of impact varieties.
   * @param {array} varietiesCount - Array of frequencies for each variety.
   * @param {array} lossPerYear - Array of impact lossesPerYear.
   * @param {array} lossesPerYearCount - Array of frequencies for each loss per year.
   */
  constructor (days, daysCount, years, yearsCount, months, monthsCount, ratings, ratingsCount, varieties, varietiesCount, lossesPerYear, lossesPerYearCount) {
   /**
    * @property {object} days - Data object storing day information.
    */
    this.days = { day: days, count: daysCount };
   /**
    * @property {object} months - Data object storing day information.
    */
    this.months = { month: months, count: monthsCount };
    /**
    * @property {object} days - Data object storing day information.
    */
    this.years = { year: years, count: yearsCount };
    /**
    * @property {object} ratings - Data object storing rating information.
    */
    this.ratings = { rating: ratings, count: ratingsCount };
   /**
    * @property {object} varieties - Data object storing rating information.
    */
    this.varieties = { variety: varieties, count: varietiesCount };
    /**
    * @property {object} lossPerYear - Data object storing yearly loss information.
    */
    this.lossesPerYear = { lossPerYear: lossesPerYear, count: lossesPerYearCount };
  } //end of constructor

  //cascaded object create function for impactData (technically a factory)
  /**
   * Alternative copy constructor.
   * @function impactData#createactorData
   * @param {object} object - Contains impactData properties (days, daysCount, year, yearsCount, month, monthsCount, ratings, ratingsCount, varieties, varietiesCount, lossPerYear, lossesPerYearCount).
   */
 createActorData(object) {
    if(object.type==="impactData"){
      return new impactData(object.type, object.days, object.daysCount, object.year, object.yearsCount, object.month, object.monthsCount, object.ratings, object.ratingsCount, object.varieties, object.varietiesCount, object.lossPerYear, object.lossesPerYearCount);
    } else { //end of if
      //if type is not impactData, write error to console and return error for handling
      console.log("Error: Invalid Type");
      return -1; 
    } //end of else
  } //end of createactorData method
  
  /**
   * Returns a string representation of object.
   * @function impactData#toString
   * @returns String representation of class.
   */
    toString() {
      return (JSON.stringify(this.object));
    }
} //end of actorDatas class

//////////////////
// export module
module.exports = impactData;