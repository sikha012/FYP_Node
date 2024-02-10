const express = require('express');

const router = express.Router();

const multer = require('multer');
const path = require('path');

const petProfileController = require('../controllers/petProfileController');


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
    const fileTypes = /jpeg|jpg|png/;
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
router.post('/petProfile', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            res.status(400).send({ message: err });
        } else {
            petProfileController.createPetProfile(req, res);
        }
    });
});

// Update a PetProfile by ID
router.put('/petProfile/:petId', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            res.status(400).send({ message: err });
        } else {
            petProfileController.updatePetProfile(req, res);
        }
    });
});

// Get a single PetProfile by ID
router.get('/petProfile/:petId', petProfileController.getPetProfileById);

// Get all PetProfiles
router.get('/petProfile', petProfileController.getAllPetProfiles);

// Delete a PetProfile by ID
router.delete('/petProfile/:petId', petProfileController.deletePetProfileById);

// Delete all PetProfiles
router.delete('/petProfile', petProfileController.deleteAllPetProfiles);

module.exports = router;