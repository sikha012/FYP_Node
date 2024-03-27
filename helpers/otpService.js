const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "test123";
const conn = require('../connection/db.js');
const emailService = require("../helpers/sendMail");



async function sendOTP(email, callback) {
    const otp = otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    const ttl = 5 * 60 * 1000; // 5 min expiry

    const expires = Date.now() + ttl;
    const data = `${email}.${otp}.${expires}`;

    const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
    const fullHash = `${hash}.${expires}`;

    var otpMessage = `Dear Customer, ${otp} is the one-time password for login.`;

    var model = {
        email: email, // Sending the original email
        subject: "Registration OTP",
        body: otpMessage,
    };
    
    console.log(email, otp, expires, data, hash, fullHash);

    emailService.sendEmail(model, (error, result) => {
        if (error) {
            return callback(error);
        }
        return callback(null, fullHash); // Send the fullHash for verification
    });
}


async function verifyOTP(params, callback) {
    let [hashValue, expires] = params.hash.split('.');

    let now = Date.now();

    if (now > parseInt(expires)) return callback("OTP EXPIRED");

    const emailWithDot = params.email;
    let atIndex = emailWithDot.indexOf('@');
    let localPart = emailWithDot.substring(0, atIndex);
    let domainPart = emailWithDot.substring(atIndex);

    // Replace only the first dot in the local part of the email
    localPart = localPart.replace('.', '');

    // Concatenate the modified local part with the domain part
    const emailWithoutFirstDot = localPart + domainPart;
    let data = `${emailWithoutFirstDot}.${params.otp}.${expires}`;

    console.log(emailWithoutFirstDot, params.otp, expires, data);

    let newCalculateHash = crypto.createHmac("sha256", key).update(data).digest("hex");
    console.log(newCalculateHash, `${newCalculateHash}.${expires}`);

    if (newCalculateHash === hashValue) {
        return callback(null, "Success");
    }
    return callback("Invalid OTP");
}


module.exports = {
    sendOTP,
    verifyOTP
}