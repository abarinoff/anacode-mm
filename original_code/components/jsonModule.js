'use strict';

angular.module('jsonModule', ['alertModule'])

.factory('jsonService', ['$http','config', 'alertService' , function($http,config,alertService) {

	var jsonService = {};

	jsonService.getFile = function(path) {
        return $http.get(path, {cache: false}).then(function(result){
            return result.data;
        });
    };

    jsonService.getHttp = function(path) {
        return $http.get(config.restService + path, {cache: false}).then(function(result){
        	//success
        	if (result.data.success) {
            	return result.data.data;
        	} else {
        		var errors = "";
        		for (var i=0; i < result.data.errors.length; i++) {
        			var e = result.data.errors[i];

        			if(e.name="NoDataFoundError"){
        				return null;
        			}

        			errors = errors + e.name + " ";
        		}
        		alertService.add('danger', 'REST service error: ' + errors);
        		return {};
        	}
        }, function(result) {
        	alertService.add('danger', 'Could noch reach server. ('+config.restService + path+')');
        	return {};
        });
    };



	jsonService.replaceAttrName = function(sourceObj, replaceList, destObj) {
		if (Array.isArray(sourceObj)) {
				destObj = destObj || [];
		} else {
	    	destObj = destObj || {};
	    }
	    for(var prop in sourceObj) {
	    	
	        if(sourceObj.hasOwnProperty(prop)) {

	            if(typeof sourceObj[prop] === 'object') {

	                if(replaceList[prop]) {
	                    var strName = replaceList[prop];
	                    if (Array.isArray(sourceObj[prob])) {
	                    	destObj[strname] = [];
	                    } else {
	                    	destObj[strName] = {};
	                    }
	                    jsonService.replaceAttrName(sourceObj[prop], replaceList, destObj[strName]);
	                } else if(!replaceList[prop]) {
	                	if (Array.isArray(sourceObj[prop])) {
	                		destObj[prop] = [] ;
	                	} else {
	                    	destObj[prop] = {};
	                    }
	                    jsonService.replaceAttrName(sourceObj[prop], replaceList, destObj[prop]);
	                }
	            } else {

	                if(replaceList[prop]) {
	                    var strName = replaceList[prop];
	                    destObj[strName] = sourceObj[prop];
	                } else if(!replaceList[prop]) {
	                    destObj[prop] = sourceObj[prop];
	                }
	            }
	        }
	    } 
    	return destObj;
	};

	jsonService.cleanupTree = function(sourceObj, destObj) {
		if (Array.isArray(sourceObj)) {
				destObj = destObj || [];
		} else {
	    	destObj = destObj || {};
	    }
	    for(var prop in sourceObj) {
	    	
	        if(sourceObj.hasOwnProperty(prop)) {
	        	if (! (prop == "children" && sourceObj[prop] == null)) {
	            if(typeof sourceObj[prop] === 'object') {
	            		
	                		if (Array.isArray(sourceObj[prop])) {
	                			destObj[prop] = [] ;
	                		} else {
	                    		destObj[prop] = {};
	                    	}
	                    	jsonService.cleanupTree(sourceObj[prop], destObj[prop]);
	                	
	            } else {
	                	destObj[prop] = sourceObj[prop];
	               
	            }
	        }
	        }
	    } 

	    return destObj;
	}


	jsonService.buildPlotData = function(data) {
		var plotdata = [];
		// main graph
		var main_graph = {
							"label": data.general_graph.graph_para.text_label,
							"values": data.general_graph.graph_data 
						};

		plotdata.push(main_graph);

		if(data.specific_graphs) {
			// sub graphs
			for (var i=0; i < data.specific_graphs.length; i++ ) {
				var sg=data.specific_graphs[i];
				var g = {
								"label": sg.graph_para.text_label,
								"values": sg.graph_data
				}
				plotdata.push(g);
			}
		}


		return jsonService.replaceAttrName(plotdata,{
										"lower_quartile": "Q1", 
										"lower_whisker": "whisker_low", 
										"median": "Q2", 
										"upper_quartile": "Q3", 
										"upper_whisker": "whisker_high",
										});
	}

	jsonService.buildGraphMeta = function(data) {
		
		var metadata = {};

		metadata[data.general_graph.graph_para.text_label] = data.general_graph.graph_para;

		if(data.specific_graphs) {
			// sub graphs
			for (var i=0; i < data.specific_graphs.length; i++ ) {
				var sg=data.specific_graphs[i];
				metadata[sg.graph_para.text_label] = sg.graph_para;
			}
		}


		return metadata;
	}

	jsonService.queryFromMeta = function(meta) {
		var query = "";

		if(meta.product && meta.product != null) {
			query = "product="+meta.product.id;
		}

		if(meta.features && meta.features != null) {
			for(var i=0; i< meta.features.length; i++) {

				if(query=="") {
					query = "features="+meta.features[i].id;
				} else {
					query = query + "&features="+meta.features[i].id;
				}
			}
		}

		return query;
	}



    return jsonService;
}]);