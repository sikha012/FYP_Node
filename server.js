require("dotenv").config();


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');



require('./connection/db.js');

const  userRoute = require('./routes/userRoute.js');
const  webRoute = require('./routes/webRoute.js');
const petCategoryRoute = require('./routes/petCategoryRoute');
const petProfileRoute = require('./routes/petProfileRoute');
const productCategoryRoute = require('./routes/productCategoryRoute');
const productSellerRoute = require('./routes/productSellerRoute');
const productRoute = require('./routes/productRoute');
const orderRoute = require('./routes/orderRoute.js');
const userPaymentRoute = require('./routes/userPaymentRoute.js');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors());
app.use('/', userRoute);
app.use('/', webRoute);
app.use('/', petCategoryRoute);
app.use('/', petProfileRoute);
app.use('/', productCategoryRoute);
app.use('/', productSellerRoute);
app.use('/', productRoute);
app.use('/', orderRoute);
app.use('/', userPaymentRoute);

//error handling
app.use((err,req,res,next)=>{

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server";
    res.status(err.statusCode).json({
            message:err.message,
    });
});

app.listen(8001, ()=> console.log(
    'Server is running on port 8001'
));