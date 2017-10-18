"use strict";
////////////////////////////////
// IncidentSummary Object Class
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
 * Class for IncidentSummary object.
 * @class
 * @memberof vcdbFactory
 * @lends IncidentSummary.prototype
 */
class IncidentSummary { 

  //prototype of IncidentSummary model which takes a JSON object as argument for flexibility
  /**
   * @constructs IncidentSummary
   * @param {object} date - Contains the incident date.
   * @param {string} victim - Victim name.
   * @param {string} discovery - Means of discovery.
   * @param {string} actor - Type of actor.
   * @param {string} asset - Assets affected.
   * @param {string} industry - Industry.
   * @param {string} country - Country code.
   * @param {string} reference - Source of information (url).
   * @param {string} summary - Summary of incident data.
   */
  constructor (date, victim, discovery, actor, asset, industry, country, reference, summary) {
    /**
     * @property {object} date - Contains the incident date.
     */
    this.date = date;
    /**
     * @property {string} victim - Victim name.
     */
    this.victim = victim;
    /**
     * @property {string} discovery - Means of discovery.
     */
    this.discovery = discovery;
    /**
     * @property {string} actor - Type of actor.
     */
    this.actor = actor;
    /**
     * @property {string} asset - Assets affected.
     */
    this.asset = asset;
    /**
     * @property {string} industry - Industry.
     */
    this.industry = industry;
    /**
     * @property {string} country - Country code.
     */
    this.country = country;
    /**
     * @property {string} reference - Source of information (url).
     */
    this.reference = reference;
    /**
     * @property {string} summary - Summary of incident data.
     */
    this.summary = summary;
    
  } //end of constructor

  //cascaded object create function for IncidentSummary (technically a factory)
  /**
   * Alternative copy constructor.
   * @function IncidentSummary#createIncidentSummary
   * @param {object} object - Contains IncidentSummary properties (date, victim, discovery, actor, asset, industry, country, reference, summary).
   */
 createIncidentSummary(object) {
    if(object.type==="IncidentSummary"){
      return new IncidentSummary(object.date, object.victim, object.discovery, object.actor, object.asset, object.industry, object.country, object.reference, object.summary);
    } else { //end of if
      //if type is not IncidentSummary, write error to console and return error for handling
      console.log("Error: Invalid Type");
      return -1; 
    } //end of else
  } //end of createIncidentSummary method
  
  /**
   * Returns a string representation of object.
   * @function IncidentSummary#toString
   * @returns String representation of class.
   */
    toString() {
      return (JSON.stringify(this.object));
    }
} //end of IncidentSummarys class

//////////////////
// export module
module.exports = IncidentSummary;