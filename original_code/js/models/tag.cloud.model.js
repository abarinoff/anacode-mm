angular.module('marketMinerModels').factory('TagCloudModel', ['$resource',
    function($resource) {
        var TagCloudModel = $resource('http://81.169.214.217:5000/query/freqdist?topic=:topic&tagtype=:type');

        return TagCloudModel;
    }
]);
