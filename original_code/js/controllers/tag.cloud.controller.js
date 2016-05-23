angular.module("marketMinerControllers", []).controller("TagCloudController", ["$scope", "TagCloudModel",
    function ($scope,  TagCloudModel) {

        $scope.colors = ["#9f1097", "#993333", "#226ccc", "#439922", "#7b0099", "#9f1097", "#993333", "#226ccc", "#439922", "#7b0099"];

        $scope.initialize = function() {
            console.log("initialize");
            $scope.getData();
        };

        $scope.getData = function() {
            TagCloudModel.get({topic: "fashion", type: "concept"}, function (response) {
                $scope.words = _.map(response.data, function(item) {
                    return {
                        text: item[0],
                        weight: item[1]
                    }
                });
                console.log("Tag Cloud Data: ", $scope.words);
                console.log("Tag Cloud colors: ", $scope.colors);
            });
        };
    }
]);
