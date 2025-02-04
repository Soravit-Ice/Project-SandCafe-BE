module.exports = function (app , admin) {
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
app.get('/api/getAllUser', userController.getAllUser)
app.get('/api/getPointUserById',[authJwt.verifyToken], userController.getPointByUser)
//upload
//editUser
app.get('/api/productFindAll', productController.getAllProduct)
app.post('/api/checkoutOrder',upload.single('file'),[authJwt.verifyToken], (req, res) => productController.checkoutOrder( req, res))
app.post('/api/updateUser',[authJwt.verifyToken], userController.updateUserById)
app.get('/api/findProduct/:productId', productController.getProductById)
app.post('/api/saveProduct',upload.single('file'), productController.saveProduct)
app.post('/api/addToOrder',[authJwt.verifyToken], productController.addToOrder)
app.get('/api/getOrderDetail',[authJwt.verifyToken], productController.getOrderDetailItems)
app.delete('/api/deleteOrderItem/:itemId',[authJwt.verifyToken], productController.deleteOrderItem)
app.put('/api/updateOrderItem/:itemId',[authJwt.verifyToken], productController.updateOrderItem)
app.post('/api/saveOrderDetail', productController.saveOrderDetail)
app.post('/api/cancelOrderDetail', productController.cancelOrder)
app.get('/api/getOrderDetailAdmin', productController.getOrderDetail);
app.delete('/api/deleteProduct/:productId', productController.deleteProduct);
app.put('/api/changeStatusOrder/:idOrder', productController.changeStatusOrderDetail);
app.get('/api/orders', productController.getOrderHistoryByDate);
app.get('/api/getOrderHistoryByUserId',[authJwt.verifyToken], productController.getOrderHistoryByUserId);

app.get('/api/getDiscount',[authJwt.verifyToken], productController.getDiscount);
app.post('/api/redeemPoints',[authJwt.verifyToken], productController.redeemPoints);
app.post('/api/applyDiscount',[authJwt.verifyToken], productController.applyDiscount);
app.post('api/save-fcm-token',[authJwt.verifyToken], userController.saveFCMToken);
}
