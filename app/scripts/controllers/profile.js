'use strict';

angular.module('dateaWebApp')
.controller('ProfileCtrl'
, [ '$scope'
  , 'User'
  , 'config'
  , 'Api'
  , '$routeParams'
  , '$interpolate'
  , 'ActivityUrl'
, function (
    $scope
  , User
  , config
  , Api
  , $routeParams
  , $interpolate
  , ActivityUrl
) {

	var sup
	  // fn declarations
	  , buildUserInfo
	  , buildUserDateos
	  , buildUserCampaigns
	  , buildPagination
	  , buildPaginationCampaigns
	  , buildPaginationDateos
	  , buildActivityLog
	  , buildActivityUrl
	  ;

	$scope.targetUser = {};
	$scope.targetUser.history = [];
	$scope.paginationCampaigns = {};
	$scope.paginationDateos = {};

	buildActivityLog = function () {
		var activityLog = [];
		Api.activityLog
		.getActivityOfUserByUserId(
		{ user : User.data.id
		, mode : 'all'
		} )
		.then( function ( response ) {
			console.log( 'buildActivityLog response', response );
			activityLog = response.objects.filter( function ( value ) {
				return !!~config.activityLog.activityVerbs.indexOf( value.verb );
			} );
			angular.forEach( activityLog, function ( value, key ){
				value._url = ActivityUrl.parse( value );
				value._message = $interpolate( config.activityLog.activityContentMsg.byUser[ value.verb ] )(value);
				console.log( '$scope.targetUser', $scope.targetUser );
				$scope.targetUser.history.push( value );
			});
		} )
	}

	buildUserDateos = function ( givens ) {
		var index
		  , defaultQuery
		  ;

		index = givens && givens.index * config.profile.dateosOffset;
		defaultQuery = { limit  : 3
		               , offset : index || 0
		               , user   : $routeParams.username
		               }

		Api.dateo
		.getDateos( defaultQuery )
		.then( function ( response ) {
			console.log( response );
			$scope.targetUser.dateos = response.objects;
			buildPaginationDateos( response );
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	buildUserCampaigns = function ( givens ) {
		var index
		  , defaultQuery
		  ;

		index = givens && givens.index * config.profile.campaignsOffset;
		defaultQuery = { limit : config.profile.campaignsOffset
		               , offset : index || 0
		               , user : $routeParams.username
		               }

		Api.campaign
		.getCampaigns( defaultQuery )
		.then( function ( response ) {
			console.log( 'buildUserCampaigns', response.objects );
			$scope.targetUser.campaigns = response.objects;
			buildPaginationCampaigns( response );
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	buildUserInfo = function () {
		Api.user
		.getUserByUserIdOrUsername( { username : $routeParams.username } )
		.then( function ( response ) {
			console.log( 'user info', response);
			angular.extend($scope.targetUser, response);
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildPaginationCampaigns = function( response ) {
		$scope.paginationCampaigns.totalItems = response.meta.total_count;
		$scope.paginationCampaigns.itemsPerPage = config.profile.paginationLimit;
	}

	$scope.$watch( 'paginationCampaigns.currentPage', function () {
		buildUserCampaigns( { index : $scope.paginationCampaigns.currentPage - 1 } );
	} );

	buildPaginationDateos = function ( response ) {
		$scope.paginationDateos.totalItems   = response.meta.total_count;
		$scope.paginationDateos.itemsPerPage = config.profile.paginationLimit;
	}

	$scope.$watch( 'paginationDateos.currentPage', function () {
		buildUserDateos( { index : $scope.paginationDateos.currentPage - 1 } );
	} );

	if ( $routeParams.username ) {
		buildUserInfo();
		buildUserDateos();
		buildUserCampaigns();
		buildActivityLog();
	}

} ] );