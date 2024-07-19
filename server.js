require('dotenv').config();
const express = require('express');
const server = express();
const Path = require('path');

const systemModel = require('./Model/authModel');
const mongoose = require('mongoose');
const cookie = require('cookie-parser');
const router = require('./Router/authRouter');
const Port = process.env.PORT || 5900;

const session = require('express-session');
const flash = require('connect-flash');


server.set('view engine','ejs');
server.set('views','View');
server.use(express.urlencoded({extended:true}));
server.use(express.static(Path.join(__dirname,'Public')));
server.use(express.static(Path.join(__dirname,'Uploads')));

server.use(cookie());
server.use(session({
    secret:'project-secret-key',
    resave:false,
    saveUninitialized:false
}))
server.use(flash());
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
    next();
  });
server.use(router);
mongoose.connect(process.env.DATABASE_URL)
.then(()=>{
    console.log("The Database Connected Successfully");
    server.listen(Port,()=>{
        console.log(`The Server is Running at ${Port}`);
    })
}).catch(error=>{
    console.log("The Databse is not Connected Successfully",error);
})

