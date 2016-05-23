'use strict';

angular.module('alertModule', [])

.factory('alertService', function() {

    var service = {
        add: add,
        closeAlert: closeAlert,
        closeAlertIdx: closeAlertIdx,
        clear: clear,
        get: get
    },
    alerts = [];

    return service;

    function add(type, msg) {
        return alerts.push({
            type: type,
            msg: msg,
            close: function() {
                return closeAlert(this);
            }
        });
    }

    function closeAlert(alert) {
        return closeAlertIdx(alerts.indexOf(alert));
    }

    function closeAlertIdx(index) {
        return alerts.splice(index, 1);
    }

    function clear(){
        alerts = [];
    }

    function get() {
        return alerts;
    }
});