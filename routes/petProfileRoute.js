const express = require('express');

const router = express.Router();

const multer = require('multer');
const path = require('path');

const petProfileController = require('../controllers/petProfileController');

const {petProfileCreationValidation} = require('../helpers/validation.js');

const isAuth = require('../middleware/auth.js');

const storage = multer.diskStorage({

    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/pet_images'));
    },
    filename:function(req,file,cb){
        const imageName = Date.now()+'-'+file.originalname;
        cb(null,imageName);
    }

});

const filefilter = (req,file,cb) => {
    const fileTypes = /jpeg|jpg|png|octet-stream/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if(mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid Image Type! Only JPEG, JPG, and PNG suppoerted');
    }
 };

 const upload = multer({
    storage: storage,
    limits: {fileSize: 5000000},
    fileFilter: filefilter
 }).single('petImage');
 
 // Create a new PetProfile
// router.post('/petProfile', isAuth, (req, res) => {
//     upload(req, res, (err) => {
//         if(err) {
//             res.status(400).send({ message: err });
//         } else {
//             petProfileController.createPetProfile(req, res);
//         }
//     });
// });
 router.post('/petProfile',  (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            res.status(400).send({ message: err });
        } else {
            petProfileController.createPetProfile(req, res);
        }
    });
});



router.put('/petProfile/:petId', isAuth, (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            res.status(400).send({ message: err });
        } else {
            petProfileController.updatePetProfile(req, res);
        }
    });
});


router.get('/petProfile/:petId', petProfileController.getPetProfileById);

router.get('/petProfile/owner/:ownerId', petProfileController.getAllByOwnerId);

router.post('/petProfile/history', petProfileController.createPetHistory);

router.get('/petProfile/history/:petId', petProfileController.getHistoryByPetId);

// Get all PetProfiles
router.get('/petProfile', petProfileController.getAllPetProfiles);

// Delete a PetProfile by ID
router.delete('/petProfile/:petId', petProfileController.deleteByPetId);

router.delete('/petProfile/history/:historyId', petProfileController.deleteHistoryById);

// Delete all PetProfiles
router.delete('/petProfile', petProfileController.deleteAllPetProfiles);

module.exports = router;