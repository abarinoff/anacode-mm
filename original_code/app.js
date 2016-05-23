'use strict';

// Declare app level module which depends on views, and components
angular.module('marketminer', [
  'ngRoute',
  'boxplotview',
  'ui.bootstrap',
  'jsonModule',
  'alertModule',
  'angularjs-dropdown-multiselect',
  'ngJsTree',
  'pascalprecht.translate'
])
.constant("config", {
	"restService" : "http://81.169.214.217:5000"
})
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/boxplotview'});
}])
.config(function ($translateProvider) {

  $translateProvider.useStaticFilesLoader({
    prefix: 'lang-',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('en_US');
})
.run(function($rootScope) {
	$rootScope.selection={};
})
.controller('AlertCtrl', ['$scope', 'alertService', function($scope, alertService) {
	$scope.alerts = alertService.get();
}])
.controller('SidebarCtrl', ['$rootScope', '$scope', 'jsonService', function($rootScope, $scope, jsonService) {

    var sc = this;

    //$scope.productsTreeInstance={};
    //$scope.featuresTreeInstance={};

    $scope.productsTreeConfig = {
            core : {
                multiple : false,
                animation: false,
                error : function(error) {
                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                },
                check_callback : true,
                worker : true,
                themes : {
            		  icons : false
        		    }
            },
            checkbox : {
              cascade : '',
              three_state : false
            },
            version : 1,
            plugins : ['wholerow','checkbox']
        };

    $scope.featuresTreeConfig = {
            core : {
                multiple : false,
                animation: false,
                error : function(error) {
                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                },
                check_callback : true,
                worker : true,
                themes : {
            		  icons : false
        		    }
            },
            checkbox : {
              cascade : '',
              three_state : false
            },
            version : 1,
            plugins : ['wholerow','checkbox']
        };



	$scope.treedata_products = [];
	$scope.treedata_features = [];

	jsonService.getHttp("/static/products")
		.then(function(data) {
			$scope.treedata_products.push.apply($scope.treedata_products,
				jsonService.replaceAttrName(
					jsonService.cleanupTree(data),
					{"label": "label"}
				).children
			);
			$scope.productsTreeConfig.version++;
		});

	jsonService.getHttp("/static/features")
		.then(function(data) {
			$scope.treedata_features.push.apply($scope.treedata_features,
				jsonService.replaceAttrName(
					jsonService.cleanupTree(data),
					{"label": "label"}
				).children
			);
			$scope.featuresTreeConfig.version++;
		});


    $scope.changedProductsCB = function(e, item) {
            var product = "";
            for(var i=0; i < item.selected.length; i++) {
            	var id = item.selected[i];
             	var sel = item.instance._model.data[id];
             	//if (sel.children.length==0) {
             		product=sel;
             	//}
            }
            $rootScope.selection.product=product;
            $rootScope.$broadcast("updateGraph");
    };

    $scope.changedFeaturesCB = function(e, item) {
    		var features=[];

            for(var i=0; i < item.selected.length; i++) {
            	var id = item.selected[i];
             	var sel = item.instance._model.data[id];
             	//if (sel.children.length==0) {
             		features.push(sel);
             	//}
            }
            $rootScope.selection.features=features;
            $rootScope.$broadcast("updateGraph");
    };

    $scope.onProductSelect = function(branch) {
    	$rootScope.selection.product=branch.label;
    	$rootScope.$broadcast("updateGraph");
    }

    $scope.onFeatureSelect = function(branch) {
    	$rootScope.selection.feature=branch.label;
    	$rootScope.$broadcast("updateGraph");
    }

    $scope.$on("updateTrees", function () {
      sc.productsTreeInstance.jstree(true).deselect_all(true);
      sc.productsTreeInstance.jstree(true).select_node($scope.selection.product.id, true, false);


      sc.featuresTreeInstance.jstree(true).deselect_all(true);
      for(var i=0; i < $scope.selection.features.length; i++) {
          var id = $scope.selection.features[i].id;   
          sc.featuresTreeInstance.jstree(true).select_node(id, true, false);

      }

    });


}])
.controller('FooterCtrl', ['$rootScope', '$scope', 'jsonService', '$translate',  function($rootScope, $scope, jsonService, $translate) {

	$scope.usage_context = []; 
	$scope.location_context = []; 
	$scope.resource_context = []; 

	$scope.usage_context_settings = { 
      smartButtonMaxItems: 3, 
      externalIdProp: '', 
      smartButtonTextConverter: function(itemText, originalItem) { return itemText; } 
  };
	$scope.location_context_settings = { 
      smartButtonMaxItems: 3, 
      scrollableHeight: '350px', 
      scrollable: true, 
      enableSearch: true, 
      externalIdProp: '', 
      smartButtonTextConverter: function(itemText, originalItem) { return itemText; },
      groupByTextProvider: function(frequent) { if (frequent == 0) { return 'Frequent'; } else { return 'Others'; } } 
  };
	$scope.resource_context_settings = { 
      smartButtonMaxItems: 3, 
      externalIdProp: '', 
      smartButtonTextConverter: function(itemText, originalItem) { return itemText; } 
  };

	$scope.usage_context_data = [];
	$scope.location_context_data = [];
	$scope.resource_context_data = [];

  // AngularJS Dropdown Multiselect doesn't work async at the moment 
  $translate(['CONTEXT_SHOWALL']).then(function (t) {
	   $scope.usage_context_texts = {buttonDefaultText: t.CONTEXT_SHOWALL};
	   $scope.location_context_texts = {buttonDefaultText: t.CONTEXT_SHOWALL};
     $scope.resource_context_texts = {buttonDefaultText: t.CONTEXT_SHOWALL};
  });

  jsonService.getHttp("/static/contexts")
      .then(function(data) {
      $scope.usage_context_data = jsonService.replaceAttrName(data,{"text": "label"})[0].members;
      $scope.usage_context_data.sort(function(a, b) {if (a.label < b.label) return -1; if (a.label > b.label) return 1; return 0})
      $scope.location_context_data = jsonService.replaceAttrName(data,{"text": "label"})[1].members;
      $scope.location_context_data.sort(function(a, b) {if (a.label < b.label) return -1; if (a.label > b.label) return 1; return 0})
      $scope.location_context_data.forEach(function(element, index, array){element.frequent=1-element.frequent});
      $scope.resource_context_data = jsonService.replaceAttrName(data,{"text": "label"})[2].members;
  });

	

	$scope.$watch('usage_context', function(newValue) {
		$rootScope.selection.usage_context = newValue;
	});
	$scope.$watch('location_context', function(newValue) {
		$rootScope.selection.location_context = newValue;
	});
	$scope.$watch('resource_context', function(newValue) {
		$rootScope.selection.resource_context = newValue;
	});

	$scope.applyFilters = function() {
		$rootScope.$broadcast("updateGraph");
	}

}]);


