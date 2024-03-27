const {check, body} =require ('express-validator');

exports.signUpValidation = [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'Password is required').isLength({min:6}),
    check('location', 'Please enter a location').not().isEmpty(),
    check('contact', 'Please enter a contact').not().isEmpty(),
]

// petName: req.body.petName,
//         petAge: req.body.petAge,
//         vaccinationDate: req.body.vaccinationDate,
//         petCategoryId: req.body.petCategoryId,
//         ownerId: req.body.ownerId,
//         petImage: req.file ? req.file.filename : null // Use null if no image is uploaded

// exports.petProfileCreationValidation = [
//     check('petName', 'Pet name is required').not().isEmpty(),
//     check('petAge', 'Pet age is required').not().isEmpty(),
//     check('vaccinationDate', 'Last vaccination date is required').not().isEmpty(),
//     check('petCategoryId', 'Pet category is required').not().isEmpty(),
//     check('ownerId', 'Pet owner id is required').not().isEmpty(),
//     body().custom((value, { req }) => {
//         if (!req.file) { // Checking if req.file is not present
//             throw new Error('Pet image is required');
//         }
//         // You could also add more checks here for file type, size, etc.
//         return true; // Return true if validation is passed
//     }),
// ]

exports.loginValidation = [
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'Password is required').isLength({min:6}),
 ]

 exports.forgetValidation = [
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    
 ]

 exports.updateProfileValidation = [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('location', 'Please enter a location').not().isEmpty(),
    check('contact', 'Please enter a contact').not().isEmpty(),
]
