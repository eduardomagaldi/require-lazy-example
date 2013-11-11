var fs = require("fs"),
	express = require("express"),
	app = express();

app.use(express.static(__dirname));

app.use(express.static(__dirname + '/build'));

app.listen(8110);