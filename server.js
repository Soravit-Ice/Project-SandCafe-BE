const express = require('express');
const app = express();
const cors = require('cors'); 
const bodyParser = require('body-parser');

const corsOptions = {
  origin: '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json())

require('./src/router/router.js')(app);


  

var server = app.listen(8080, function () {

	var host = server.address().address
	var port = server.address().port

	console.log("App listening at 8080", host, port)
})
