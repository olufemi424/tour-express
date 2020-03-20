const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protect other routes from un-authenticated user
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

//protect routes from unauthorized user
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.restrictTo('admin', 'user'),
    userController.deleteUser
  );

module.exports = router;
