"use strict";
////////////////////////////////
// attackData Object Class
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
 * Class for attackData object.
 * @class
 * @memberof vcdbFactory
 * @lends attackData.prototype
 */
class attackData { 

  /**
   * @constructs attackData
   * @param {array} varieties - Array of attack varieties.
   * @param {array} varietiesCount - Array of frequencies for each variety.
   * @param {array} types - Array of employee numbers.
   * @param {array} typesCount - Aray of frequencies for each employee count.
   * @param {array} vectors - Array of attack vectors.
   * @param {array} vectorsCount - Array of frequencies for each vector.
   * @param {array} assets - Array of attack assets.
   * @param {array} assetsCount - Array of frequencies for each asset.
   * @param {array} discoveries - Array of attack discoveries.
   * @param {array} discoveriesCount - Array of frequencies for each discovery.
   */
  constructor (varieties, varietiesCount, types, typesCount, vectors, vectorsCount, assets, assetsCount, discoveries, discoveriesCount) {
   /**
    * @property {object} varieties - Data object storing variety information.
    */
    this.varieties = { variety: varieties, count: varietiesCount };
   /**
    * @property {object} vectors - Data object storing variety information.
    */
    this.vectors = { vector: vectors, count: vectorsCount };
   /**
    * @property {object} varieties - Data object storing variety information.
    */
    this.types = { type: types, count: typesCount };
   /**
    * @property {object} assets - Data object storing variety information.
    */
    this.assets = { asset: assets, count: assetsCount };
    /**
    * @property {object} discoveries - Data object storing discovery information.
    */
    this.discoveries = { discovery: discoveries, count: discoveriesCount };
    
  } //end of constructor

  //cascaded object create function for attackData (technically a factory)
  /**
   * Alternative copy constructor.
   * @function attackData#createattackData
   * @param {object} object - Contains attackData properties.
   */
 createattackData(object) {
    if(object.type==="attackData"){
      return new attackData(object.varieties, object.varietiesCount, object.types, object.typesCount, object.vectors, 
                            object.vectorsCount, object.assets, object.assetsCount, object.discoveries, object.discoveriesCount);
    } else { //end of if
      //if type is not attackData, write error to console and return error for handling
      console.log("Error: Invalid Type");
      return -1; 
    } //end of else
  } //end of createattackData method
  
  /**
   * Returns a string representation of object.
   * @function attackData#toString
   * @returns String representation of class.
   */
    toString() {
      return (JSON.stringify(this.object));
    }
} //end of attackDatas class

//////////////////
// export module
module.exports = attackData;