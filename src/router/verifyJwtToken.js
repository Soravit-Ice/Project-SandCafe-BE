const { PrismaClient } = require("@prisma/client")
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const userClient = new PrismaClient().user;

verifyToken = (req, res, next) => {
	let token = req.headers['x-access-token'];
  
	if (!token){
		return res.status(403).send({ 
			auth: false, message: 'No token provided.' 
		});
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err){
			return res.status(403).send({ 
					auth: false, 
					message: 'Fail to Authentication. Error -> ' + err 
				});
		}
		req.userId = decoded.id;
		req.userNameLogin = decoded.fullname
		next();
	});
}

isAdmin = (req, res, next) => {	
	userClient.findUnique({
        where: {
            hn_id: hnId,
        },
      }).then(user => {
			if(user){
				if(user.role === "ADMIN"){
					next();
					return;
				}
			}else{
				res.status(403).send({data:"Require Admin Role!",status:400});
				return;
			}
		}).catch(err => {
			res.status(400).send("Error" + err);
			return;
		});
}


const authJwt = {};
authJwt.verifyToken = verifyToken;
authJwt.isAdmin = isAdmin;

module.exports = authJwt;