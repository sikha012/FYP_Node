const express = require('express');

const router = express.Router();


const path = require('path');
const multer = require ('multer');

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
   (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')?
   cb(null,true):cb(null,false);
}
const upload = multer({
    
    storage:storage,
    fileFilter:filefilter
});

const {signUpValidation,loginValidation, forgetValidation, updateProfileValidation} = require('../helpers/validation.js');

const userController = require('../controllers/userController.js');
const isAuth = require('../middleware/auth.js');

router.post('/register', signUpValidation, userController.register);
router.post('/login',loginValidation, userController.login);

router.get('/get-user', isAuth.isAuthorize, userController.getUser);

router.post('/forget-password', forgetValidation, userController.forgetPassword);

router.post('/update-profile', upload.single('image'), updateProfileValidation, isAuth.isAuthorize, userController.updateProfile);
module.exports = router;
