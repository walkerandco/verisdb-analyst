"use strict";
//////////////////////
// Chart Controller
/**
 * @author Steven Walker-Roberts
 * @version v0.0.1
 * @copyright Copyright (C) Steven Walker-Roberts 2017. MIT License.
 */

/////////////////
// Requires
/** 
 * @requires jstat
 * @external jstat
 * @see {@link https://www.npmjs.com/package/jstat}
 */
var jstat = require('jstat');
/** 
 * @requires lodash
 * @external lodash
 * @see {@link https://www.npmjs.com/package/lodash}
 */
var _ = require('lodash');
/** 
 * @requires socketio-client
 * @external socketio
 * @see {@link https://www.npmjs.com/package/socket.io-client}
 */
const io = require('socket.io-client');
/** 
 * Creates socket instance.
 * @global
 */
var socket = io.connect();

/**
 * Data Controller for Angular
 * @class
 * @memberof vcdbServer
 * @lends vcdbControllerClient.prototype
 */

/////////////////////////
// Exports angular scope
/**
 * @constructs vcdbControllerClient
 */
module.exports = function($scope, $timeout) {
    
    //////////////
    // Imports
    /**
     * Imports jstat library into $scope
     * @global
     */
    $scope.jstat = jstat;
    /**
     * Imports jstat library into $scope
     * @global
     */
    $scope._ = _;
  
    ///////////////
    // Debug Mode
    /**
     * Debug flag.
     * @const
     * @type {boolean}
     */
    $scope.debug = 1;  
  
    //////////////
    // State 
    /**
     * Application state object.
     * @const
     * @type {object}
     */
    $scope.appState = {
      query: "", //holds most recent search query
      mode: "search", //defaults to search mode
      searchReturned: 0, //search status
      searchData: 0, //contains search data
      loading: 1, //loading state
      actor: 'internal', // default actor mode type to retrieve
      attack: 'misuse', //actor mode type to retrieve
      removeUnknown: 0, //whether to remove unknown results
	  match: null //default match object
    }

  ////////////////////
  // Helper Functions
  
  /**
   * Clears search state.
   * @function dataController#clear
   */
    $scope.clear = () => {
      //clear search state
      $scope.appState.query = '';
	  $scope.appState.match = '';
      $scope.appState.group = '';
	  $scope.appState.sort = '';
	  $scope.appState.unwind = '';
      $scope.appState.searchData = 0;
      $scope.appState.searchReturned = 0;
      $scope.appState.victimData = '';
    };
  
  /**
   * Sets the application mode.
   * @function dataController#mode
   * @param {string} mode - Application view mode.
	 * @param {integer} removeUnknown - Flag for removing unknown values.
   */
    $scope.mode = (mode, removeUnknown) => {
      if ($scope.appState.mode === 'search' || $scope.appState.mode === 'multidim') $scope.clear();
      //change mode if provided
      if(mode) $scope.appState.mode = mode;
			//if no removeUknown value provided, pull from scope
			if(!removeUnknown) removeUnknown = $scope.appState.removeUnknown;
			//execute correct function dependant on mode
			switch(mode){
				case 'actor':
					$scope.getActorData($scope.appState.actor, $scope.appState.match, removeUnknown);
					break;
				case 'attack':
					$scope.getAttackData($scope.appState.attack, $scope.appState.match, removeUnknown);
					break;
				case 'impact':
					$scope.getImpactData($scope.appState.match, removeUnknown)
					break;
				case 'multidim':
					$scope.appState.mode = 'multidim';
					break;
				case 'victim':
					$scope.getVictimData($scope.appState.match, removeUnknown)
					break;
			}
    }
		
		/**
		 * Toggle the filter menu.
		 * @function dataController#toggleFilter
		 */
		$scope.toggleFilter = () => {
			$scope.filterToggle = ($scope.filterToggle===0 ? 1 : 0);
		}

  /////////////////////////
  // Data Functions
   
  /**
   * Notifies a failure.
   * @function dataController#fail
   */
   $scope.fail = ()=> {
	   if($scope.appState.loading){
		   $scope.appState.fail = 1;
	   }
   }
   
   /**
   * Recovers the application after a crash.
   * @function dataController#recover
   */
   $scope.recover = ()=> {
	window.location.reload();
   }
   
  /**
   * Submits a search across the socket.
   * @function dataController#search
   * @fires external:socketio#emit:search
   */
    $scope.search = () => {
      //display loading advice
      $scope.appState.loading = 1;
			//open filter so that users know it has persisted
			$scope.appState.filterToggle = 1;
			//set a failure timeout
			$timeout($scope.fail, 7000);
        /**
         * Sends search query to socket.
         * @event external:socketio#emit:search
         * @type {string}
         * @property {string} query - Contains search query.
         */
      socket.emit('search', $scope.appState.query);
      console.log((new Date()).toISOString()+" - New search request made for query"+$scope.appState.query+".");
      if ($scope.debug) console.log($scope);
    };
  
  /**
   * Submits an actor request across the socket.
   * @function dataController#getActorData
   * @param {string} type - Type of actor data to retrieve (subject-object in actor heirarchy of VERIS)
   * @param {string} match - Match query.
   * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
   * @fires external:socketio#emit:attack
   */
    $scope.getActorData = (type, match, removeUnknown) => {
      //display loading advice
      $scope.appState.loading = 1;
	  		//set a failure timeout
			$timeout($scope.fail, 7000);
      //prevent JSON error on server
      if(match === '') match = null;
			//check correct mode
			if($scope.appState.mode !== 'actor') $scope.appState.mode = 'actor';
      //set actor type
      if(type) $scope.appState.actor = type;
      //flag for unknown entry removal
      if(removeUnknown === -1)  removeUnknown = 1;
      if($scope.appState.removeUnknown !== removeUnknown) $scope.appState.removeUnknown = removeUnknown;
      /**
       * Sends actor query to socket.
       * @event external:socketio#emit:actor
       */
      socket.emit('actor', $scope.appState.actor, match, $scope.appState.removeUnknown);
      console.log((new Date()).toISOString()+" - New actor data request made.");
      if ($scope.debug) console.log($scope);
    };
  
  /**
   * Submits an attack request across the socket.
   * @function dataController#getAttackData
   * @param {string} match - Match query.
   * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
   * @fires external:socketio#emit:attack
   */
    $scope.getAttackData = (type, match, removeUnknown) => {
      //display loading advice
      $scope.appState.loading = 1;
			//set a failure timeout
			$timeout($scope.fail, 7000);
      //check correct mode
			if($scope.appState.mode !== 'attack') $scope.appState.mode = 'attack';
			//set attack type
      if(type) $scope.appState.attack = type;
      //set match to null on delete to avoid server error
      if(match === '') match === null;
      //flag for unknown entry removal
      if(removeUnknown === -1)  removeUnknown = 1;
      if($scope.appState.removeUnknown !== removeUnknown) $scope.appState.removeUnknown = removeUnknown;
      /**
       * Sends Attack query to socket.
       * @event external:socketio#emit:attack
       */
      socket.emit('attack', $scope.appState.attack, match, $scope.appState.removeUnknown);
      console.log((new Date()).toISOString()+" - New attack data request made.");
      if ($scope.debug) console.log($scope);
    };
	
  /**
   * Submits an impact request across the socket.
   * @function dataController#getImpactData
   * @param {string} type - Type of impact data to retrieve (subject-object in impact heirarchy of VERIS)
   * @param {string} match - Match query.
   * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
   * @fires external:socketio#emit:impact
   */
    $scope.getImpactData = (match, removeUnknown) => {
      //display loading advice
      $scope.appState.loading = 1;
			//set a failure timeout
			$timeout($scope.fail, 7000);
      //prevent JSON error on server
      if(match === '') match = null;
	  //check correct mode
	  if($scope.appState.mode !== 'impact') $scope.appState.mode = 'impact';
      //flag for unknown entry removal
      if(removeUnknown === -1)  removeUnknown = 1;
      if($scope.appState.removeUnknown !== removeUnknown) $scope.appState.removeUnknown = removeUnknown;
      /**
       * Sends impact query to socket.
       * @event external:socketio#emit:impact
       */
      socket.emit('impact', match, $scope.appState.removeUnknown);
      console.log((new Date()).toISOString()+" - New impact data request made.");
      if ($scope.debug) console.log($scope);
    };
	
  /**
   * Submits a victim request across the socket.
   * @function dataController#getVictimData
   * @param {string} match - Match query.
   * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
   * @fires external:socketio#emit:victim
   */
    $scope.getVictimData = (match, removeUnknown) => {
      //display loading advice
      $scope.appState.loading = 1;
			//set a failure timeout
			$timeout($scope.fail, 7000);
      //set match to null on delete to avoid server error
      if(match === '') match === null;
			//check correct mode
			if($scope.appState.mode !== 'victim') $scope.appState.mode = 'victim';
      //flag for unknown entry removal
      if(removeUnknown === -1)  removeUnknown = 1;
      if($scope.appState.removeUnknown !== removeUnknown) $scope.appState.removeUnknown = removeUnknown;
      /**
       * Sends victim query to socket.
       * @event external:socketio#emit:victim
       */
      socket.emit('victim', match, $scope.appState.removeUnknown);
      console.log((new Date()).toISOString()+" - New victim data request made.");
      if ($scope.debug) console.log($scope);
    };
	
  /**
   * Submits a inspect request across the socket.
   * @function dataController#inspect
   * @param {boolean} removeUnknown - Whether to exclude reported unknown values.
   * @fires external:socketio#emit:inspect
   */
    $scope.inspect = (removeUnknown) => {
      //display loading advice
      $scope.appState.loading = 1;
			//set a failure timeout
			$timeout($scope.fail, 7000);
      //set match to null on delete to avoid server error
      if(match === '') match === null;
			//check correct mode
			if($scope.appState.mode !== 'inspect') $scope.appState.mode = 'inspect';
      //flag for unknown entry removal
      if(removeUnknown === -1)  removeUnknown = 1;
      if($scope.appState.removeUnknown !== removeUnknown) $scope.appState.removeUnknown = removeUnknown;
      /**
       * Sends inspect query to socket.
       * @event external:socketio#emit:inspect
       */
      socket.emit('inspect', $scope.appState.match, $scope.appState.group, $scope.appState.sort, $scope.appState.unwind, removeUnknown);
      console.log((new Date()).toISOString()+" - New inspect data request made.");
      if ($scope.debug) console.log($scope);
    };
  
    /////////////
    // Events
    
    /**
     * Provides initial state to application.
     * @listens external:socketio#emit:initialobject
     */
    //initial push of state from server
    socket.on('initialobject', (data) => {
      $scope.appState = data;
      console.log($scope);
      $scope.$apply();
      if ($scope.debug) console.log($scope);
    });
    
    /**
     * Provides the results of an inspection query.
     * @listens external:socketio#on:searchData
     */
    socket.on('inspection', data => {
      //close loading advice
      $scope.appState.loading = 0;
      //set view flag returned
      $scope.appState.searchReturned = 1;
      //load search results into app state
      $scope.appState.searchData = data;
      console.log((new Date()).toISOString()+" - The inspection successfully returned "+$scope.appState.searchData.length+" results.");
      if ($scope.debug) console.log($scope);
      //reload view manually due to async
      $scope.$apply();
    })
	
	/**
     * Provides the results of a search query.
     * @listens external:socketio#on:searchData
     */
    socket.on('searchData', data => {
      if ($scope.appState.mode !== 'search') return 0;
      //close loading advice
      $scope.appState.loading = 0;
      //set view flag returned
      $scope.appState.searchReturned = 1;
      //load search results into app state
      $scope.appState.searchData = data;
      console.log((new Date()).toISOString()+" - The search successfully returned "+$scope.appState.searchData.length+" results.");
      if ($scope.debug) console.log($scope);
      //reload view manually due to async
      $scope.$apply();
    })
  
  /**
     * Provides the results of an actor query.
     * @listens external:socketio#on:actorData
     */
    socket.on('actorData', data => {
      if ($scope.appState.mode !== 'actor') return 0;
      //close loading advice
      $scope.appState.loading = 0;
      //load search results into app state
      $scope.appState.actorData = data;
      console.log((new Date()).toISOString()+" - The actor data successfully returned results.");
      if ($scope.debug) console.log($scope);
      //reload view manually due to async
      $scope.$apply();
    })
  
    /**
     * Provides the results of an attack query.
     * @listens external:socketio#on:attackData
     */
    socket.on('attackData', data => {
      if ($scope.appState.mode !== 'attack') return 0;
      //close loading advice
      $scope.appState.loading = 0;
      //load search results into app state
      $scope.appState.attackData = data;
      console.log((new Date()).toISOString()+" - The attack data successfully returned results.");
      if ($scope.debug) console.log($scope);
      //reload view manually due to async
      $scope.$apply();
    })
	
	/**
     * Provides the results of an impact query.
     * @listens external:socketio#on:impactData
     */
    socket.on('impactData', data => {
      if ($scope.appState.mode !== 'impact') return 0;
      //close loading advice
      $scope.appState.loading = 0;
      //load search results into app state
      $scope.appState.impactData = data;
	  $scope.appState.impactData.override = [{ yAxisID: 'y-axis-1' }];
	  $scope.appState.impactData.options = {
		scales: {
		  yAxes: [
			{
			  id: 'y-axis-1',
			  type: 'logarithmic',
			  display: true,
			  position: 'left',
			  scaleLabel: {
				display: true,
				labelString: 'Loss Amount (USD)'
			  }
			}
		  ]
		}
	  };
      console.log((new Date()).toISOString()+" - The impact data successfully returned results.");
      if ($scope.debug) console.log($scope);
      //reload view manually due to async
      $scope.$apply();
    })
    
    /**
     * Provides the results of a victim query.
     * @listens external:socketio#on:victimData
     */
    socket.on('victimData', data => {
      if ($scope.appState.mode !== 'victim') return 0;
      //close loading advice
      $scope.appState.loading = 0;
      //load search results into app state
      $scope.appState.victimData = data;
      console.log((new Date()).toISOString()+" - The victim data successfully returned results.");
      if ($scope.debug) console.log($scope);
      //reload view manually due to async
      $scope.$apply();
    })
 
};