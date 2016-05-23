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
            });
        };
    }
]);
