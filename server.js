var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

var app = express();
app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + "/original_code"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({"extended": "true"}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

app.get('/', function(req, res) {
    res.sendfile('tag-cloud.html');
});

app.listen(app.get('port'), function() {
    console.log("App listening on port ", app.get('port'));
});