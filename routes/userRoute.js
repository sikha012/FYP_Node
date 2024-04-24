const express = require('express');

const router = express.Router();


const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({

    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/images'));
    },
    filename:function(req,file,cb){
        const imageName = Date.now()+'-'+file.originalname;
        cb(null,imageName);

    }

});

const filefilter = (req,file,cb)=>{
   (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || 'image/octet-stream')?
   cb(null,true):cb(null,false);
};

const upload = multer({
    
    storage:storage,
    fileFilter:filefilter
});

const {signUpValidation,loginValidation, forgetValidation, updateProfileValidation} = require('../helpers/validation.js');

const userController = require('../controllers/userController.js');
const isAuth = require('../middleware/auth.js');
const { auth } = require('firebase-admin');

router.post('/register',signUpValidation, userController.register);

router.post('/resend-otp', userController.sendOTP);

router.post('/verify-otp', userController.verifyOTP);

router.post('/login',loginValidation, userController.login);
router.post('/refresh-token', userController.verifyRefreshToken);
// router.get('/user', userController.verifyAccessToken, (req, res) => {
//     const user_id = req.user_id;
//     res.send({userId: user_id});
// });

router.get('/get-user', isAuth,userController.getUser);

router.get('/users', userController.getAllUsers);

router.post('/users/filter', userController.getUsersByFilter);

router.post('/updateFCMtoken/:userId', forgetValidation, userController.updateFCMToken);

router.post('/forget-password', forgetValidation, userController.forgetPassword);

router.post('/update-profile/:userId', upload.single('image'), updateProfileValidation, isAuth, userController.updateProfile);

router.post('/logout',  isAuth, userController.logout);

module.exports = router;
