'use strict';

angular.module('dateaWebApp')
.controller( 'CampaignListCtrl'
, [ '$scope'
	, 'Api'
	, 'config'
	, 'shareMetaData'

, function (
		$scope
	, Api
	, config
	, shareMetaData
) {

	var doQuery
	  , getCategories
	  , buildPagination
	  , shareData
	;

	$scope.query = {
		  page       : 1
		, numResults : 18
		, totalCount : 0
		, orderBy	   : '-featured,-created'
		, category	 : 'all'
	};
	$scope.flow  = {};
	$scope.flow.orderByOptions = [
		  {val: '-featured,-created', label: 'destacados'}
		, {val: '-created', label: 'recientes'}
		, {val: '-dateo_count,-created', label: 'más dateadas'}
	];

	$scope.dateFormat        = config.defaultDateFormat;

	// SEO AND SOCIAL TAGS
	shareData = {
		  title       : 'Datea | Iniciativas'
		, description : 'Busca iniciativas dateras sobre temas que te importan.'
	}
	shareMetaData.setData(shareData);

	getCategories = function () {
		Api.category
		.getCategories( {} )
		.then( function ( response ) {
			$scope.flow.categories = response.objects;
			$scope.flow.categories.unshift({id: 'all', 'name': '-- todas --'});
		} );
	}

	$scope.flow.doQuery = function () {
		var params      = {};
		$scope.flow.campaigns = [];
		$scope.flow.loading = true;

		params.limit    = $scope.query.numResults;
		params.offset   = ($scope.query.page - 1) * params.limit;
		params.order_by = $scope.query.orderBy;
		if ($scope.query.search && $scope.query.search.trim() !== '') {
			params.q = $scope.query.search;
		}
		if ($scope.query.category && $scope.query.category !== 'all') {
			params.category_id = $scope.query.category;
		}  
		Api.campaign
		.getCampaigns( params )
		.then( function ( response ) {
			$scope.flow.campaigns = response.objects;
			$scope.query.totalCount = response.meta.total_count;
			buildPagination( response );
			$scope.flow.loading = false;
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	$scope.$watch('query.page', function () {
		$scope.flow.doQuery();
	});

	buildPagination = function ( response ) {
		$scope.query.totalCount  = response.meta.total_count;
		$scope.query.numResults  = 18;
	}

	getCategories();
	$scope.flow.doQuery();


} ] );
