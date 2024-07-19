const express = require('express');
const route = express.Router();
const multer = require('multer');
const PATH = require('path');
const jwtAuth = require('../middleware/authmiddleWare');
const {getSignup,postSignup,getLogin, postLogin,mail_confirmation, getDashBoard, getBlog, postBlog, getViewBlog, userAuth, logOut} = require('../Controller/authController');

const fileStorage = multer.diskStorage({
    destination:(req,file,callback)=>{
      callback(null,PATH.join(__dirname,"..","Uploads"),(err,data)=>{
        if(err) throw err;
      });
    },
    filename:(req,file,callback)=>{
      callback(null,file.originalname,(err,data)=>{
        if(err) throw err;
      });
    }
  });
  
  const fileFilter = (req,file,callback)=>{
    if(
      file.mimetype.includes("png")||
      file.mimetype.includes("jpg")||
      file.mimetype.includes("jpeg")||
      file.mimetype.includes("webp")
  
    ){
      callback(null,true);
    }else{
      callback(null,false);
    }
  }
  
  const upload = multer({
    storage:fileStorage,
    fileFilter:fileFilter,
    limits:{fieldSize:1024*1024*5},
  })
  const upload_type = upload.array("blogImage",2);
  
  
  

route.get("/signup",getSignup);
route.post("/postSignup",postSignup);

route.get("/login",getLogin);
route.post("/postLogin",postLogin);
//router.get("/Dashboard",AuthJwt.authJwt,userAuth,dashBoard);
route.get("/dashboard",jwtAuth.authJWT,userAuth,getDashBoard);
route.get("/blogPage",jwtAuth.authJWT,userAuth,getBlog);
route.post("/postBlog",upload_type,postBlog);
route.get("/viewBlog",jwtAuth.authJWT,userAuth,getViewBlog);

// For Email Verification: 
route.get("/mail_confirmation/:email/:token",mail_confirmation);
route.get("/logOut",jwtAuth.authJWT,userAuth,logOut);

module.exports = route;