
var nodemailer = require('nodemailer');

async function sendEmail(params, callback){

    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure:false,
        requireTLS:true,
        auth: {
            user: 'sikhakunwar07@gmail.com',
            pass: 'capwoukycskzdqsj'
        }
    });
    
    const mailOptions = {
        from: 'sikhakunwar07@gmail.com',
        to:params.email,
        subject:params.subject,
        text: params.body,
    };

    transport.sendMail(mailOptions, function(error,info){
        if(error){
            return callback(error);
        }
        else {
            return callback(null, info.response);
        }
    });
}


module.exports = {
    sendEmail
}