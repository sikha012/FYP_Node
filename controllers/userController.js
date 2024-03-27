const { validationResult } = require('express-validator');
const otpService = require('../helpers/otpService.js');
const bcrypt = require('bcryptjs');
const conn = require('../connection/db.js');
const randomstring = require('randomstring');
const sendMail= require('../helpers/sendMail.js');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const {JWT_SECRET, REFRESH_TOKEN_SECRET} = process.env;



const register = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userEmail = conn.escape(req.body.email);

    conn.query(
        `SELECT * FROM userprofiles WHERE LOWER(user_email) = LOWER(${userEmail});`,
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: err.sqlMessage || 'Database error'
                });
            }

            if (result && result.length) {
                return res.status(409).send({
                    message: 'This email is already in use!'
                });
            } else {
                // Call sendOTP here
                otpService.sendOTP(req.body.email, (error, results) => {
                    if (error) {
                        return res.status(500).send({
                            message: "Error sending OTP",
                            data: error,
                        });
                    }

                    // Proceed to save the user's data
                    bcrypt.hash(req.body.password, 10, (hashErr, hash) => {
                        if (hashErr) {
                            return res.status(500).send({
                                message: hashErr
                            });
                        }

                        const userName = conn.escape(req.body.username);
                        const userLocation = conn.escape(req.body.location);
                        const userContact = conn.escape(req.body.contact);
                        const userType = conn.escape(req.body.userType);

                        const sql = `INSERT INTO userprofiles (user_name, user_email, user_password, user_location, user_contact, user_type) VALUES (${userName}, ${userEmail}, ${conn.escape(hash)}, ${userLocation}, ${userContact}, ${userType})`;

                        conn.query(sql, (insertErr) => {
                            if (insertErr) {
                                return res.status(500).send({
                                    message: insertErr.sqlMessage || 'Database error'
                                });
                            }

                            
                            return res.status(200).send({
                                message: 'Signed up successfully. Please check your email for the OTP to complete your registration.',
                                data:results,
                            });
                        });
                    });
                });
            }
        }
    );
};


const verifyOTP = (req, res) => {
    otpService.verifyOTP(req.body, (error, results)=>{
        if(error){
            return res.status(400).send({
                message:"error",
                data:error,
            });
        }
        return res.status(200).send({
            message:"Success",
            data:results,
        });
    });
};



const login = (req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const sql = `SELECT * FROM userprofiles WHERE user_email = ${conn.escape(req.body.email)};`;

    conn.query(sql, (err, result) => {
        if (err) {
            return res.status(400).send({
                message: err
            });
        }
        if (!result.length) {
            return res.status(401).send({
                message: 'Email not found!'
            });
        }
            bcrypt.compare(
                req.body.password,
                result[0]['user_password'],
                (bErr, bMatch) => {
                    if(bErr)
                    {
                        return res.status(400).send({
                            message:bErr
                        });
                    }
                    if(bMatch) {
                        //console.log(JWT_SECRET);
                         const accessToken = jwt.sign({id:result[0]['user_id']},JWT_SECRET,{expiresIn :'1m'});
                         const refreshToken = jwt.sign({id:result[0]['user_id']},REFRESH_TOKEN_SECRET,{expiresIn :'2d'});
                         const refreshTokenExpiration = new Date();
                         refreshTokenExpiration.setDate(refreshTokenExpiration.getDate() + 3);
                         conn.query('UPDATE userprofiles SET refresh_token_expiry = ?, refresh_token = ? WHERE user_id = ?', 
                         [refreshTokenExpiration, refreshToken, result[0]['user_id']],
                         (err, rslt) => {
                            if(err) {
                                return res.status(500).send({
                                    message: 'Internal Server Error'
                                });
                            }
                            
                            return res.status(200).send({
                               message : 'Logged In',
                               accessToken, 
                               refreshToken,
                               user: result[0]
                           });
                         });
                    } else {
                        return res.status(401).send({
                            message:'Password is incorrect'
                        });                       
                    }
                }
            )
        }
    )
}

const verifyRefreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;

    conn.query('SELECT * FROM userprofiles WHERE refresh_token = ?', [refreshToken], (err, result) => {
        if(err) {
            return res.status(500).send({
                message: 'Internal Server Error'
            });
        }

        if(result.length === 0) {
            return res.status(403).send({
                message: 'Invalid Refresh Token'
            });
        }

        const user = result[0];
        const refreshTokenExpirationDate = new Date(user.refresh_token_expiry);
        
        if(refreshTokenExpirationDate <= new Date()) {
            conn.query('UPDATE userprofiles SET refresh_token = NULL, refresh_token_expiry = NULL WHERE user_id = ?',
            [user.user_id],
            (err, result) => {
                if(err) {
                    return res.status(500).send({
                        message: 'Internal Server Error'
                    });
                }

                return res.status(403).send({
                    message: 'Refresh token expired'
                });
            });
        } else {
            const accessToken = jwt.sign({id:user.user_id},JWT_SECRET,{expiresIn :'1m'});
            return res.send({accessToken});
        }
    });

}

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(" ")[1];

    if(!accessToken) {
        return res.status(401).send({
            message: 'Access Token is missing'
        });
    }

    jwt.verify(accessToken, JWT_SECRET, (err, user) => {
        if(err) {
            return res.status(401).send({
                message: 'Invalid Access Token'
            });
        }
        req.user_id = user.user_id;
        next();
    });
}

const getUser = (req, res) => {

    const authToken = req.headers.authorization.split(' ')[1];
    const decodeToken = jwt.verify(authToken, JWT_SECRET);

    conn.query('SELECT * FROM userprofiles where user_id=?', decodeToken.id, function(error, result, fields){
        if(error) throw error;

        return res.status(200).send(result[0]);
    });
}

const verifyMail = (req, res) => {
    var token = req.query.token;
    conn.query('SELECT * FROM userprofiles where token=? limit 1', token, function(error, result, fields){
        if(error){
            console.log(error.message);
            return res.render('mail-verification.ejs', {message: 'Mail Verification Failed!'});
        }
        if(result.length > 0){

            conn.query(`UPDATE userprofiles SET token = null, isVerified = 1 WHERE user_id = '${result[0].user_id}'`);

            return res.render('mail-verification.ejs', {message: 'Mail Verified Successfully!'});

        } else {
            return res.render('404.ejs');
        }
    });
}




const forgetPassword = (req, res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    var email = req.body.email;
    conn.query('SELECT * FROM userprofiles where user_email=? limit 1', email,function(error, result,fields){
        if(error){ 
            return res.status(400).json({message:error});
        }

        if(result.length>0){

            let mailSubject = 'Forget Password';

            const randomString = randomstring.generate();
            let content = '<p> Hi, '+result[0].username+' \
             Please <a href="http://localhost:8001/forget-password?token='+randomString+'"> Click here</a> to reset your password</p>\
            ';
            sendMail(email,mailSubject,content);

            // userEmail = conn.escape(result[0].email);
            // userToken = conn.escape(randomString);
        conn.query(
                `DELETE FROM password_reset WHERE user_email = ${conn.escape(result[0].user_email)}`


             );
            conn.query(
               `INSERT INTO password_reset (user_email, token) VALUES (${conn.escape(result[0].user_email)}, '${randomString}')`
          );
          return res.status(200).send({
            message: "Mail sent successfully!"
          });
         
        }

        return res.status(401).send({
            message:"Email doesn't exist!"
        });
    });


}

const forgetPasswordLoad = (req, res) => {
    try {
       var token = req.query.token;
       if(token == undefined){
            res.render('404');
       } 
       conn.query(`SELECT * FROM password_reset where token = ? limit 1`, token, function(error, result, fields){
            if(error) {
                console.log(error.message);
            }

            if(result.length > 0){

                conn.query(`SELECT * FROM userprofiles WHERE user_email = ? limit 1`, result[0].user_email, function(error, result, fields){
                    if(error) {
                        console.log(error.message);
                    }
                    res.render('forget-password', {user: result[0]});
                });

            } else {
                res.render('404');
            }
       });
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = (req, res) => {
    if (req.body.password != req.body.confirm_password) {
        res.render('forget-password', {error_message: `Passwords don't match!`, user: {user_id: req.body.id, user_email: req.body.email}});
    }
    bcrypt.hash(req.body.confirm_password, 10, (err, hash) => {
        if(err) {
            console.log(err);
        }
        conn.query(`DELETE FROM password_reset WHERE user_email = '${req.body.user_email}'`);
        conn.query(`UPDATE userprofiles SET user_password = '${hash}' WHERE user_id = '${req.body.user_id}'`);
        res.render('reset-message', {message: 'Password Successfully Reset!'});       
    })
};

const updateProfile =(req,res)=>{

    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            });
         }
        
        //  const token = req.headers.authorization.split(' ')[1];
        //  const decodeToken = jwt.verify(token, JWT_SECRET);
        const userId = req.params.userId;

         var sql = '', data;

         if(req.file != null){
            sql = 'UPDATE userprofiles SET user_name = ?, user_email = ?, profile_image = ? WHERE user_id = ?';
            data = [req.body.username, req.body.email, 'images/'+req.file.filename, userId];
         } else {
            sql = 'UPDATE userprofiles SET user_name = ?, user_email = ? WHERE user_id = ?';
            data = [req.body.username, req.body.email, userId];
         }

         conn.query(sql, data, function(error, result, fields){
            if(error){
                res.status(400).send({message: `Update 400: ${error.message}`});
            }
            res.status(200).send({message: "Profile Updated Successfully!"});
         });

    }catch(error){
        return res.status(400).json({message: `Update catch 400: ${error.message}`});
        // console.log(error.message);
    }
    

}

module.exports = {
    register,
    verifyOTP,
    login,
    verifyRefreshToken,
    verifyAccessToken,
    getUser,
  verifyMail,
    forgetPassword,
    forgetPasswordLoad,
    resetPassword,
    updateProfile
};
