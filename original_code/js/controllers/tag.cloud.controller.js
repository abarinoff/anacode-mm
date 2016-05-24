angular.module("marketMinerControllers", []).controller("TagCloudController", ["$scope", "TagCloudModel",
    function ($scope,  TagCloudModel) {

        $scope.topics = ['airline', 'appliances', 'auto', 'babies', 'beauty', 'books', 'camera', 'ce', 'digital', 'education', 'entertainment', 'fashion', 'finance', 'fitness', 'food', 'furniture', 'games', 'health', 'hotel', 'internet', 'mobile', 'music', 'realestate', 'sports', 'travel'];
        $scope.selectedTopic = $scope.topics[0];

        $scope.types = ['concept', 'word'];
        $scope.selectedType = $scope.types[0];

        $scope.colors = ["#9f1097", "#993333", "#226ccc", "#439922", "#7b0099", "#9f1097", "#993333", "#226ccc", "#439922", "#7b0099"];

        $scope.initialize = function() {
            console.log("initialize");
            $scope.getData();
        };

        $scope.submit = function() {
            $scope.getData();
        };

        $scope.getData = function() {
            TagCloudModel.get({topic: $scope.selectedTopic, type: $scope.selectedType}, function (response) {
                $scope.words = _.map(response.data, function(item) {
                    return {text: item[0], weight: item[1]};
                });
                var maxSize = _.max(response.data, function(item){ return item[1]; })[1];
                $scope.d3CloudWords = _.first(_.map(response.data, function(item) {
                    return {text: item[0], size: Math.round(10 + item[1] / maxSize * 90)};
                }), 150);
                $("#d3-cloud").empty();
                $scope.drawCloud();
            });
        };

        $scope.drawCloud = function() {
            var fill = d3.scale.category20();

            var layout = d3.layout.cloud()
                .size([960, 600])
                .words($scope.d3CloudWords)
                .padding(5)
                .rotate(function() { return 0; })
                .font("Impact")
                .fontSize(function(d) { return d.size; })
                .on("end", draw);

            layout.start();

            function draw(words) {
                d3.select("#d3-cloud").append("svg")
                    .attr("width", layout.size()[0])
                    .attr("height", layout.size()[1])
                    .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("font-family", "Impact")
                    .style("fill", function(d, i) { return fill(i); })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
            }
        }
    }
]);
