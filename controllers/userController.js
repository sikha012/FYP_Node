const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const conn = require('../connection/db.js');
const randomstring = require('randomstring');
const sendMail= require('../helpers/sendMail.js');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const {JWT_SECRET} =process.env;

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
                    msg: err.sqlMessage || 'Database error'
                });
            }

            if (result && result.length) {
                return res.status(409).send({
                    msg: 'This user is already in use!'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (hashErr, hash) => {
                    if (hashErr) {
                        return res.status(500).send({
                            msg: hashErr
                        });
                    }
                 
                    else{
                    const userName = conn.escape(req.body.username);
                    const userLocation = conn.escape(req.body.location);
                    const userContact = conn.escape(req.body.contact);

                    const sql = `INSERT INTO userprofiles (user_name, user_email, user_password, user_location, user_contact) VALUES (${userName}, ${userEmail}, ${conn.escape(hash)}, ${userLocation}, ${userContact})`;

                    conn.query(sql, (insertErr) => {
                        if (insertErr) {
                            return res.status(500).send({
                                msg: insertErr.sqlMessage || 'Database error'
                            });
                        }
                        else{
                            
                           
                        

                        let mailSubject = 'Mail Verification';
                        const randomToken = randomstring.generate();
                        let content = '<p>Hi! '+req.body.username+', \
                        Please <a href = "http://localhost:8001/mail-verification?token='+randomToken+'">Verify</a> your Mail';
                        sendMail(req.body.email, mailSubject, content);
                            
                        conn.query('UPDATE userprofiles set token=? where user_email=?',[randomToken,req.body.email],function(error,result,fields){
                            if(error){
                                console.error(error);
                                return res.status(400).send({
                                    msg: err
                                });

                            }
                        });
                        return res.status(200).send({
                            msg : 'Signed Up Successfully',
                        });
                        }
                        
                    });
                    }
                });
            }
        }
    );
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
                msg: err
            });
        }
        if (!result.length) {
            return res.status(401).send({
                msg: 'Email not found!'
            });
        }
            bcrypt.compare(
                req.body.password,
                result[0]['user_password'],
                (bErr, bResult) => {
                    if(bErr)
                    {
                        return res.status(400).send({
                            msg:bErr
                        });
                    }
                    if(bResult){
                        //console.log(JWT_SECRET);
                         const token = jwt.sign({id:result[0]['user_id']},JWT_SECRET,{expiresIn :'1h'});
                         
                         return res.status(200).send({
                            msg : 'Logged In',
                            token,
                            user:result[0]
                        });
                    }
                    return res.status(401).send({
                        msg:'Password is incorrect'
                    });
                       
                }
            )

        }
    )

}

const getUser = (req,res) => {

    const authToken = req.headers.authorization.split(' ')[1];
    const decodeToken = jwt.verify(authToken, JWT_SECRET);

    conn.query('SELECT * FROM userprofiles where user_id=?', decodeToken.id, function(error, result, fields){
        if(error) throw error;

        return res.status(200).send({
            success:true, data:result[0], message:"Fetched successfully!"
        });
    });
}

const verifyMail = (req, res) => {
    var token = req.query.token;
    conn.query('SELECT * FROM userprofiles where token=? limit 1', token, function(error, result, fields){
        if(error){
            console.log(error.message);
            return res.render('mail-verification.ejs', {message: 'Mail Verification Failed 1!'});
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

const updateProfile =(req,res)=>{

    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array()
            });
         }
        
         const token = req.headers.authorization.split(' ')[1];
         const decodeToken = jwt.verify(token, JWT_SECRET);

         var sql = '', data;

         if(req.file != undefined){
            sql = 'UPDATE userprofiles SET user_name = ?, user_email = ?, profile_image = ? WHERE user_id = ?';
            data = [req.body.username, req.body.email, 'images/'+req.file.filename, decodeToken.id];
         } else {
            sql = 'UPDATE userprofiles SET user_name = ?, user_email = ? WHERE user_id = ?';
            data = [req.body.username, req.body.email, decodeToken.id];
         }

         conn.query(sql, data, function(error, result, fields){
            if(error){
                res.status(400).send({msg: error.message});
            }
            res.status(200).send({msg: "Profile Updated Successfully!"});
         });

    }catch(error){
        return res.status(400).json({msg: error.message});
        // console.log(error.message);
    }
    

}

module.exports = {
    register,
    login,
    getUser,
    verifyMail,
    forgetPassword,
    forgetPasswordLoad,
    updateProfile
};
