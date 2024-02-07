
const nodemailer = require('nodemailer');

// const {SMTP_MAIL, SMTP_PASSWORD} = process.env;

const sendMail = async (email,mailSubject, content) => {
    try{
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
            to:email,
            subject:mailSubject,
            html:content
        }
        // transport.sendMail(mailOptions, function(error, info){
        //     if(error){
        //         console.log(error);
        //     }
        //     else{
        //         console.log('Mail sent successfully: ', info.respose);
        //     }
        // });
        const info = await transport.sendMail(mailOptions);
        console.log('Mail sent successfully: ', info.response);
    }catch(error){
        console.log(error.message);
    }

}
module.exports = sendMail;