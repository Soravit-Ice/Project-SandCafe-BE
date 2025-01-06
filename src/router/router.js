module.exports = function (app) {
  const userController = require('../controller/userController.js')
  const adminController = require('../controller/adminController.js')
  const productController = require('../controller/productController.js')
const authJwt = require('../router/verifyJwtToken.js')
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
 const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config({path:__dirname+'../.env'});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })


  const storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
    }, 
    });
  
  const upload = multer({ storage: storage });


app.post('/api/login', userController.login)
app.post('/api/signup', userController.signup)
//getByIdUser
app.get('/api/getUserById',[authJwt.verifyToken], userController.getUserById)
//upload
//editUser
app.post('/api/getUserById',[authJwt.verifyToken], userController.getUserById)
app.get('/api/productFindAll', productController.getAllProduct)
app.post('/api/saveProduct',upload.single('file'), productController.saveProduct)
app.post('/api/saveOrderDetail', productController.saveOrderDetail)
app.post('/api/cancelOrderDetail', productController.cancelOrder)

  
}
