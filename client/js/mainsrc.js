"use strict";
//////////////////////
// Veris Analyst Server
/**
 * @author Steven Walker-Roberts
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 *
 * VerisDB Analyst Client Application
 * @module vcdb
 */

///////////
// Requires

/** 
 * @requires angular
 * @external angular
 * @see {@link https://www.npmjs.com/package/angular}
 */
const angular = require('angular');
/** 
 * @requires angular-router-browserify
 * @external angular-router-browserify
 * @see {@link https://www.npmjs.com/package/angular-router-browserify}
 */
require('angular-router-browserify')(angular);
/** 
 * @requires angular-chart.js
 * @external angular-chart.js
 * @see {@link https://www.npmjs.com/package/angular-chart.js}
 */
require('angular-chart.js');
/** 
 * @requires angular-read-more
 * @external angular-read-more
 * @see {@link https://www.npmjs.com/package/angular-read-more}
 */
require('angular-read-more');
/** 
 * @requires angular-module-sanitize
 * @external angular-module-sanitize
 * @see {@link https://www.npmjs.com/package/angular-sanitize}
 */
var sanitize = require('angular-sanitize');
/** 
 * @requires angular-animate
 * @external angular-animate
 * @see {@link https://www.npmjs.com/package/angular-animate}
 */
var ngAnimate = require('angular-animate');

///////////////////////////////////
// Start of AngularJS Application
var app = angular.module('vcdb', ['ngRoute', ngAnimate, 'chart.js', sanitize, "hm.readmore"]);


//Include annexes to angular application.
require('./controllers');