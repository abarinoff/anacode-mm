'use strict';

/*jslint browser: true*/
/*global jQuery*/


angular

  .module('boxplotview', [
    'ngRoute',
    'jsonModule',
    'nvd3',
    'pascalprecht.translate',
    'ui.bootstrap'
  ])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/boxplotview', {
      templateUrl: 'views/boxplotview.html',
      controller: 'BoxplotviewCtrl'
    });
  }])

  .controller('BoxplotviewCtrl', ['$rootScope', '$scope', 'jsonService', '$translate', '$uibModal', function ($rootScope, $scope, jsonService, $translate, $uibModal) {

    $scope.plotavailable = false;

    $translate(['CHART_NODATA','CHART_Q1','CHART_Q2','CHART_Q3','CHART_MEAN','CHART_WHISKERLOW','CHART_WHISKERHIGH','CHART_EVALS']).then(function (t) {

        $scope.trans = {
                            "Q1": t.CHART_Q1, 
                            "Q2": t.CHART_Q2,
                            "Q3": t.CHART_Q3,
                            "mean": t.CHART_MEAN,
                            "whisker_low": t.CHART_WHISKERLOW,
                            "whisker_high": t.CHART_WHISKERHIGH,
                            "n_evals": t.CHART_EVALS 
                       };

        $scope.plotoptions = {
            chart: {
                type: 'anacodeboxPlotChart',
                height: 500,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 50
                },
                color: ['#271A9C', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA', '#89B1FA'],
                x: function (d) {return d.label; },
                //y: function(d){return d.values.Q3;},
                maxBoxWidth: 55,
                minBoxWidthFactor: 1 / 2.618,  // patched by sfl
                subgraphSpace: (55 + 50 + 20) * 0.618,  // patched by sfl
                yDomain: [-6, 6],
                tooltip: {
                    contentGenerator: function (d) {
                        if (d === null) {
                            return '';
                        }
                     
                        if (d.series.length == 3) {

                                //var idx = _.findIndex(d.series, function(s) {return s.key == 'Q2'});
                                //var c = d.series[idx].color;

                                var q1 = d.series.pop();
                                var q2 = d.series.pop();
                                q2.color = "#000000";
                                var q3 = d.series.pop();

                                d.series.push({"key": "n_evals", "value": d.data.values.n_evals, "color": "#000000"});
                                d.series.push({"key": "whisker_high", "value": d.data.values.whisker_high, "color": q3.color});
                                d.series.push(q3);
                                d.series.push(q2);
                                d.series.push({"key": "mean", "value": d.data.values.mean, "color": "#ffffff"});
                                d.series.push(q1);
                                d.series.push({"key": "whisker_low", "value": d.data.values.whisker_low, "color": q1.color});

                        }

                        var table = d3.select(document.createElement("table"))
                            .classed("legend_main", true);
         
                        var theadEnter = table.selectAll("thead")
                            .data([d])
                            .enter().append("thead");

                        theadEnter.append("tr")
                            .append("td")
                            .attr("colspan", 3)
                            .append("strong")
                            .classed("x-value", true)
                            .html(d.value);
                        

                        var tbodyEnter = table.selectAll("tbody")
                            .data([d])
                            .enter().append("tbody");

                        var trowEnter = tbodyEnter.selectAll("tr")
                                .data(function(p) { return p.series})
                                .enter()
                                .append("tr")
                                .classed("highlight", function(p) { return p.highlight});

                        trowEnter.append("td")
                            .classed("legend-color-guide",true)
                            .append("div")
                            .style("background-color", function(p) { return p.color});

                        trowEnter.append("td")
                            .classed("key",true)
                            .html(function(p, i) {
                                    var translation = $scope.trans[p.key];
                                    if (translation) {
                                        return translation;
                                    } else {
                                        return p.key;
                                    }
                                });

                        trowEnter.append("td")
                            .classed("value",true)
                            .html(function(p, i) { return p.value });


                        trowEnter.selectAll("td").each(function(p) {
                            if (p.highlight) {
                                var opacityScale = d3.scale.linear().domain([0,1]).range(["#fff",p.color]);
                                var opacity = 0.6;
                                d3.select(this)
                                    .style("border-bottom-color", opacityScale(opacity))
                                    .style("border-top-color", opacityScale(opacity))
                                ;
                            }
                        });

                        var html = table.node().outerHTML;
                        // html = html+"<pre>"+JSON.stringify(d,null,4)+"</pre>";
                        if (d.footer !== undefined)
                            html += "<div class='footer'>" + d.footer + "</div>";
                        return html;

                    }
                }, 
                noData: t.CHART_NODATA
            },
            title: {
                enable: true,
                text: ""
            },
            subtitle: {
                enable: true,
                text: ""
            }
        };
    });

    $scope.querystring="";
    $scope.plotdata = [];
    $scope.graphmeta = {};
    $scope.selection.subtype=1;


    $scope.updateGraph = function updateGraph() {

        $translate(['CHART_PLOTFOR','CHART_CONTEXT','CHART_PRODUCT','CHART_FEATURE','CHART_AND','CHART_WITHFEATURES']).then(function (t) {

          var querystring = "";
          var title = "";
          var subtitle = "";
          var titlefeatures = "";
          var i;

          if ($rootScope.selection.product !== undefined && $rootScope.selection.product !== "") {
            querystring = "product=" + $rootScope.selection.product.id;
            title = title + t.CHART_PRODUCT +" " + $rootScope.selection.product.text;
          }
          if ($rootScope.selection.features != null && $rootScope.selection.features !== undefined) {
            for (i = 0; i < $rootScope.selection.features.length; i++) {
                var feature = $rootScope.selection.features[i];
                if (feature.id != null) {
                  if (querystring === "") {
                        querystring = "features=" + feature.id;
                  } else {
                    querystring = querystring + "&features=" + feature.id;
                  }
                }
            }
            if ($rootScope.selection.features.length > 0) {
                var features = $rootScope.selection.features.map(function(f) { return f.text });
              titlefeatures = features.join(",");
              if (title === "") {
                title = t.CHART_FEATURE + " " + titlefeatures;
              } else {
                title = title + " "+t.CHART_WITHFEATURES+" " + titlefeatures;
              }
            }
          }

          if (querystring) {

            querystring = querystring + "&subfeature_type=" + $scope.selection.subtype;

            $scope.plotavailable = true;

            var usage_context = [];
            var usage_context_label = [];
            if ($rootScope.selection.usage_context != null) {
              usage_context = $rootScope.selection.usage_context.map(function (c) {
                return c.id;
              });
              usage_context_label = $rootScope.selection.usage_context.map(function (c) {
                return c.label;
              });
            }

            var location_context = [];
            var location_context_label = [];
            if ($rootScope.selection.location_context != null) {
              location_context = $rootScope.selection.location_context.map(function (c) {
                return c.id;
              });
              location_context_label = $rootScope.selection.location_context.map(function (c) {
                return c.label;
              });
            }

            var resource_context = [];
            var resource_context_label = [];
            if ($rootScope.selection.resource_context != null) {
              resource_context = $rootScope.selection.resource_context.map(function (c) {
                return c.id;
              });
              resource_context_label = $rootScope.selection.resource_context.map(function (c) {
                return c.label;
              });
            }

            var context_label = [];
            context_label.push.apply(context_label, usage_context_label);
            context_label.push.apply(context_label, location_context_label);
            context_label.push.apply(context_label, resource_context_label);

            if (context_label.length > 0) {
              subtitle = t.CHART_CONTEXT + " " + (context_label.join(", "));
            }

            if (usage_context.length > 0) {
              querystring = querystring + "&usage_contexts=" + usage_context.join("&usage_contexts=");
            }
            if (location_context.length > 0) {
              querystring = querystring + "&location_context=" + location_context.join("&location_context=");
            }
            if (resource_context.length > 0) {
              querystring = querystring + "&resource_context=" + resource_context.join("&resource_context=");
            }

            $scope.querystring = querystring;
            $scope.plotoptions.title.text = t.CHART_PLOTFOR + " " + title;
            $scope.plotoptions.subtitle.text = subtitle;
            $scope.showloading = true;

            jsonService.getHttp("/query/evaluations?" + querystring)
              .then(function (data) {
                var plotdata, min, max;
                $scope.showloading = false;
                if (data) {
                  plotdata = jsonService.buildPlotData(data);
                  $scope.graphmeta = jsonService.buildGraphMeta(data);
                  min = 0;
                  max = 0;
                  for (i = 0; i < plotdata.length; i++) {
                    if (plotdata[i].values.whisker_high > max) {
                      max = plotdata[i].values.whisker_high;
                    }
                    if (plotdata[i].values.whisker_low < min) {
                      min = plotdata[i].values.whisker_low;
                    }
                  }
                  $scope.plotoptions.chart.height = parseInt(jQuery('div.graph').height(), 10) - 14 * 2.618;
                  $scope.plotoptions.chart.width = 62 + 350 + 150 * plotdata.length; // !!! 50 + 196 * plotdata.length;
                  // feste skala
                  // $scope.plotoptions.chart.yDomain = [min - 3, max + 3];
                  $scope.plotdata = plotdata;
                } else {
                  $scope.plotoptions.chart.height = 500;
                  $scope.plotoptions.chart.width = 600;
                  $scope.querystring = "";
                  $scope.plotdata = [];
                  $scope.graphmeta = {};
                }

              });

          } else {
            $scope.plotoptions.chart.height = 500;
            $scope.plotoptions.chart.width = 600; 
            //$scope.plotavailable = false;
            $scope.querystring = "";
            $scope.plotoptions.title.text = "";
            $scope.plotoptions.subtitle.text = "";
            $scope.plotdata = [];
            $scope.graphmeta = {};
          }
        });

    }


    $scope.$on("updateGraph", function () {
      $scope.updateGraph();

      // jQuery('.tick.zero').each(function(){
      //   console.log($(this).attr('transform'));
      //   // <g class="tick zero" style="opacity: 1;" transform="translate(288.19780219780216,0)">
      // });

    });

    $scope.updateGraph();


    $scope.opentext = function(value) {
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'templates/modal_text.html',
            controller: 'ModalInstanceCtrl',
            size: null,
            resolve: {
                '$translate': function () {
                    return $translate;
                },
                'jsonService': function () {
                    return jsonService;
                },
                'meta': value
            },
            windowClass: 'text_modal'
        });
    }

    $scope.switchgraph = function(value) {
        $scope.selection.product=value.product;
        $scope.selection.product.text = $scope.selection.product.label;
        $scope.selection.features = jsonService.replaceAttrName(value.features,{"label": "text"});
        $scope.selection.location_context=value.location_context;
        $scope.selection.usage_context=value.usage_context;
        $scope.selection.resource_context=value.resource_context;
        $scope.selection.subfeature_type=value.subfeature_type;

        $rootScope.$broadcast("updateTrees");
        $scope.updateGraph();
    }


}])

.controller('ModalInstanceCtrl', function($scope, $modalInstance, $translate, jsonService, meta) {

  $scope.update = function () {
    jsonService.getHttp("/query/texts?" + querystring + "&n_texts=" + $scope.modal_items.id)
              .then(function (data) {
                $scope.texts=data;
    });
  }
  
  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };


  $scope.title = meta.text_label;
  $scope.texts = [];

  $scope.modal_items_settings = { 
            selectionLimit: 1, 
            showUncheckAll: false,
            showCheckAll: false,
            smartButtonMaxItems: 1, 
            scrollable: false, 
            closeOnSelect: true,
            smartButtonTextConverter: function(itemText, originalItem) { return itemText; } 
  };
 
  $scope.modal_items_data = [
            {id: 10, label: "10 items"}, 
            {id: 20, label: "20 items"}, 
            {id: 50, label: "50 items"}, 
            {id: 100, label: "100 items"}, 
            {id: 1000000000, label: "all items"}
  ];

  var querystring = jsonService.queryFromMeta(meta);


  if ($scope.modal_items == null) {
     $scope.modal_items = {id: 10};
  } 

  $scope.myEvents = {
    onItemSelect: function(item) {
      $scope.update();
    }
  }

  $scope.update(); 


});
