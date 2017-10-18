"use strict";
//////////////////////
// VerisDB Analyst Server
/**
 * @author Steven Walker-Roberts
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 *
 * @module vcdbControllerServer
 */

///////////////
// Debug Mode
/** 
 * Debug mode flag.
 * @global
 */
var debug = 1;

//////////////
// Requires
//core node modules
/** 
 * @requires http
 * @external http
 * @see {@link https://nodejs.org/api/http.html}
 */
const http = require('http');
/** 
 * @requires fs
 * @external fs
 * @see {@link https://nodejs.org/api/fs.html}
 */
const fs = require('fs');
/** 
 * @requires express
 * @external express
 * @see {@link https://www.npmjs.com/package/express}
 */
const express = require('express');
/** 
 * Instantiates express.
 * @global
 */
const app = express();
const jsonParser = express.json();
/** 
 * Instantiates server object.
 * @global
 */
const server = require('http').Server(app);
/** 
 * @requires socketio
 * @external socketio
 * @see {@link https://www.npmjs.com/package/socket.io}
 */
const io = require('socket.io')(server);

//own modules
/** @ignore */
const vcdbFactory = require('./factories/vcdbFactory.js')(process.argv[2], debug);

////////////////
// HTTP Server
//rest endpoints
app.get('/actors', async (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json(await vcdbFactory.reduceActorData('VCDB', 'Incidents', 'internal', null));
})
app.get('/attacks', async (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json(await vcdbFactory.reduceAttackData('VCDB', 'Incidents', 'misuse', null));
})
app.get('/impacts', async (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json(await vcdbFactory.reduceImpactData('VCDB', 'Incidents', null));
})
app.get('/victims', async (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json(await vcdbFactory.reduceVictimData('VCDB', 'Incidents', null));
})
app.post('/query', jsonParser, async (req, res) => {
	if (!req.body) res.sendStatus(400);
	else res.json(await vcdbFactory.mapAggregate('VCDB', 'Incidents', req.body.match, req.body.group, req.body.sort, req.body.unwind, req.body.removeUnknown));
})


//uses static directory 'client' for express
app.use(express.static('client'));
//any file not caught in static folder defaults to index.html
app.use((req, res) => res.sendFile(`${__dirname}/client/index.html`));
//creates listener on http module redirected to express
/**
 * Creates HTTP Server to provide Veris Analyst client.
 * @function external:express#createServer
 * @fires external:express#createServer:HTTPRequest
 * @returns {integer} - Status
 */
server.listen(15002, () => {
  console.log((new Date()).toISOString()+" - Application server started.");
}); //end of listener

/////////////////
// Socket events
/**
 * Listens for new client connections.
 * @listens external:socketio#on:connection
 * @fires external:socketio#emit:initialobject
 */
io.on('connection', async function (client) {
  console.log((new Date()).toISOString()+" - A new connection has been opened of ID "+client.id+"."); 
  /**
   * Sends initial state to client application.
   * @event external:socketio#emit:initialobject
   * @type {object}
   * @property {object} initialobject - Contains initial client state.
   */
  client.emit('initialobject', {
    clientId: client.id,
    www: await vcdbFactory.vcdbDAO.getData({}, 'www', '0'),
    query: "", //holds most recent search query
    mode: "search", //defaults to search mode
    searchReturned: 0, //search status
    searchData: 0, //contains search data
    loading: 0, //notify loaded
    actor: 'internal', // default actor mode type to retrieve
    impact: 'misuse', //actor mode type to retrieve
    removeUnknown: 0, //whether to remove unknown results
		match: null, //default match object
		filterToggle: 0 //toggle flag for filter menu
  });
  console.log((new Date()).toISOString()+" - Initial data has been emitted to client "+client.id+".");
 //initial emitter
 
 /**
   * Listens for client search requests.
   * @listens external:socketio#on:search
   * @fires external:socketio#emit:searchData
   */
  client.on('search', async (req) => {
    console.log((new Date()).toISOString()+" - The following search query was received from client "+client.id+": "+JSON.stringify(req));
    /**
     * Sends search data to client.
     * @event external:socketio#emit:searchData
     * @type {array}
     * @property {array} searchData - Contains search data.
     */
    client.emit('searchData', await vcdbFactory.reduceIncidentData(req, 'VCDB', 'Incidents'));
    }); //end of search handler
  /**
   * Listens for client actor requests.
   * @listens external:socketio#on:actor
   * @fires external:socketio#emit:actorData
   */
  client.on('actor', async (type, match, removeUnknown) => {
    console.log((new Date()).toISOString()+" - An actor query was received from client "+client.id+".");
    /**
     * Sends actor data to client.
     * @event external:socketio#emit:actorData
     * @type {array}
     * @property {array} actorData - Contains actor data.
     */
    client.emit('actorData', await vcdbFactory.reduceActorData('VCDB', 'Incidents', type, match, removeUnknown));
  }); //end of actor handler
  /**
   * Listens for client attack requests.
   * @listens external:socketio#on:attack
   * @fires external:socketio#emit:attackData
   */
  client.on('attack', async (type, match, removeUnknown) => {
    console.log((new Date()).toISOString()+" - An attack query was received from client "+client.id+".");
    /**
     * Sends attack data to client.
     * @event external:socketio#emit:attackData
     * @type {array}
     * @property {array} attackData - Contains attack data.
     */
    client.emit('attackData', await vcdbFactory.reduceAttackData('VCDB', 'Incidents', type, match, removeUnknown));
  }); //end of attack handler
  /**
   * Listens for client impact requests.
   * @listens external:socketio#on:impact
   * @fires external:socketio#emit:impactData
   */
  client.on('impact', async (match, removeUnknown) => {
    console.log((new Date()).toISOString()+" - An impact query was received from client "+client.id+".");
    /**
     * Sends impact data to client.
     * @event external:socketio#emit:impactData
     * @type {array}
     * @property {array} impactData - Contains impact data.
     */
    client.emit('impactData', await vcdbFactory.reduceImpactData('VCDB', 'Incidents', match, removeUnknown));
  }); //end of impact handler
  /**
   * Listens for client inspect requests.
   * @listens external:socketio#on:inspect
   * @fires external:socketio#emit:inspection
   */
  client.on('inspect', async (match, group, sort, unwind, removeUnknown) => {
    console.log((new Date()).toISOString()+" - An inspect query was received from client "+client.id+".");
    /**
     * Sends inspect data to client.
     * @event external:socketio#emit:inspection
     * @type {object}
     * @property {object} inspectData - Contains inspect data.
     */
    client.emit('inspection', await vcdbFactory.mapAggregate('VCDB', 'Incidents', match, group, JSON.parse(sort), unwind, removeUnknown));
  }); //end of inspect handler
  /**
   * Listens for client victim requests.
   * @listens external:socketio#on:victim
   * @fires external:socketio#emit:victimData
   */
  client.on('victim', async (match, removeUnknown) => {
    console.log((new Date()).toISOString()+" - A victim query was received from client "+client.id+".");
    /**
     * Sends victim data to client.
     * @event external:socketio#emit:victimData
     * @type {object}
     * @property {object} victimData - Contains victim data.
     */
    client.emit('victimData', await vcdbFactory.reduceVictimData('VCDB', 'Incidents', match, removeUnknown));
  }); //end of victim handler
  /**
   * Executes function on client disconnect.
   * @listens external:socketio#on:disconnect
   */
  client.on('disconnect', (reason) => {
    console.log((new Date()).toISOString()+" - Client "+client.id+" disconnected because: "+reason+".");
  }); //end of disconnect handler
}); //end of socket.js handler