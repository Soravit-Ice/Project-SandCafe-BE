module.exports = function (app) {
  const userController = require('../controller/userController.js')
  const adminController = require('../controller/adminController.js')
//   const adminController = require('../controller/classesController.js')

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

//   app.post(
//     '/api/auth/signup',
//     [
//       verifySignUp.checkDuplicateUserNameOrEmail,
//       verifySignUp.checkRolesExisted,
//     ],
//     userController.signup
//   )

//   app.post('/api/auth/signin', userController.signin)
//   app.post('/api/auth/updateAccount/:id', userController.updateUser)
//   app.get('/api/findalluser',[authJwt.verifyToken], userController.findAllUser)
//   app.delete('/api/deleteuser/:id',[authJwt.verifyToken], userController.deleteUserById);


//   app.post('/api/createclass',[authJwt.verifyToken], classesController.createClass);
//   app.get('/api/findallclass',[authJwt.verifyToken], classesController.getAllClasses);
//   app.delete('/api/deleteClass/:id',[authJwt.verifyToken], classesController.deleteClass);
//   app.put('/api/editClass/:id',[authJwt.verifyToken], classesController.editClass);
//   app.get('/api/classById/:id',[authJwt.verifyToken], classesController.getClassDetails);
//   app.get('/api/classByStudent',[authJwt.verifyToken], classesController.getClassByStudentId);
//   app.get('/api/findAllChart',[authJwt.verifyToken], classesController.getClassAndUserStats);
//   app.post('/api/submitAssignment',[authJwt.verifyToken], classesController.submitAssignment);

//   app.get(
//     '/api/getUserProfile',
// 	[authJwt.verifyToken],
//     userController.getUserProfile
//   )   

app.post('/api/login', userController.login)
app.post('/api/signup', userController.signup)

  
}
