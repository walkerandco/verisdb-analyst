"use strict";
//////////////////////
// Controller Index
/**
 * @author Steven Walker-Roberts
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 */

/**
 * Imports angular application.
 * @global app
 */
var app = require('angular').module('vcdb');

//////////
// Main
//data controller imported
app.controller('vcdbControllerClient', require('./vcdbControllerClient'));