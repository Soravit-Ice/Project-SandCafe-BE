const express = require('express');
const app = express();
const cors = require('cors'); 
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const serviceAccount = require("./eonni-cafe-service"); // Replace with your Firebase credentials
const corsOptions = {
  origin: '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json())
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
  });
require('./src/router/router.js')(app , admin);


  

var server = app.listen(8080, function () {

	var host = server.address().address
	var port = server.address().port

	console.log("App listening at 8080", host, port)
})
