const authModel = require('../Model/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TokenModel = require('../Model/tokenModel');
const blogModel = require('../Model/blogModel');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host:'smtp',
    port:465,
    secure:false,
    requireTLS: true,
    service:'gmail',
    auth:{
        user:'rohanslife1202@gmail.com',
        pass: 'ifyq bscp rxrh xdsv'
    }
})

const getSignup = (req,res)=>{
    let sms = req.flash("wrongmail");
    let errorSms = sms.length > 0 ? sms[0] : null;
    res.render("Auth/registration",{
        title:'Signup Page',
        message: errorSms
    })

}

const postSignup = async(req,res)=>{
    try{
        //console.log("The user Details collected from the form: ",req.body);
        

        let existMail = await authModel.findOne({email:req.body.email});
        if(existMail){
            console.log("SomeOne has already registered with this mail Id ", existMail);
            req.flash("wrongmail","Some one has already registered with this mail id");
            res.redirect("/signup");
        }else{

            let hashPassword = await bcrypt.hash(req.body.password,12);
            console.log("The Generated hash Password is: ",hashPassword);

            let formData = new authModel({
                name: req.body.name,
                email: req.body.email,
                password: hashPassword
            });
    
            let saveData = await formData.save();
            if(saveData){
                console.log("The Registration Details has been saved successfully into the databse",saveData);
                
                     const token_jwt = jwt.sign(
                        {email:req.body.email},
                        process.env.SECRET_KEY,
                         {expiresIn: "1h"} // It is user given
                     );
                     const Token_data = new TokenModel({
                        token: token_jwt,
                        email:saveData.email,
                        _userId:saveData._id
                     });
                     let token_saved = await Token_data.save();
                     if(token_saved){
    
                        let mailOptions ={
                            from:'rohanslife1202@gmail.com',
                            to: req.body.email,
                            subject:'Email Verification',
                            text: 'Welcome '+saveData.name+'\n\n'
                            +'You have Successfully Submitted your Data, Please verify your account by clicking the link Below'+ '\n\n'
                            +"http://"+
                            req.headers.host+
                            "/mail_confirmation/"+
                            req.body.email+"/"+
                            token_jwt+
                            "\n\nThank You"
                        }
        
                        transporter.sendMail(mailOptions,function(error,info){
                            if(error){
                                console.log("Error in Sending Mail ",error);
                                res.redirect("/Signup");
                            }else{
                                console.log("Your Mail has been send to your mail id Successfully : ",info.response);
                                 res.redirect("/login");
                                
                            }
                        })
    
                     }else{
                        console.log("Error to save Token");
                     }    
                }
    
            }

    }catch(error){
        console.log("failed to save data into the database",error);
    }
}

const getLogin = (req,res)=>{
    let errMail = req.flash("errorMail");
    let mailSms = errMail.length > 0 ? errMail[0] : null;

    let accVerification = req.flash("Mverification");
    let errVerification = accVerification.length > 0 ? accVerification[0] : null;

    let errPassword = req.flash("errPass");
    let passSms = errPassword.length > 0 ? errPassword[0] : null;

    res.render("Auth/login",{
        title:'login page',
        mailData : mailSms,
        verification : errVerification,
        passwordData : passSms
    })

}

const postLogin = async(req,res)=>{

        try{
            console.log("The email and Password collected from the Login form: ",req.body.email,req.body.password);
            let existMail = await authModel.findOne({email:req.body.email});
            if(!existMail){
                console.log("Invalid mailId for Login");
                req.flash('errorMail',"Invalid Email Id");
                res.redirect("/Login");
            }else if(existMail.isVerified == false){
                console.log("The User is Not a verified User, You need to verify your account by clicking the link that has been send to your registered mail Id");
                req.flash("Mverification","You are Not a verified User, You need to verify your account by clicking the link that has been send to your registered mail Id");
                res.redirect("/Login");
            } 
            else{
                console.log("The existing User details: ",existMail.password);
                console.log("Password collected from the login Page: ",req.body.password);
                let comparePassword = await bcrypt.compare(req.body.password,existMail.password);
                if(comparePassword){
                    let token_payload = {userData: existMail};
                    const token_jwt = jwt.sign(token_payload,process.env.SECRET_KEY,{
                    expiresIn: '1h',
                });    
                        res.cookie("token_Data",token_jwt,{
                            expires: new Date(Date.now()+ 3600000),
                            httpOnly:true,
                        });
                 
                           
                      
                    console.log("Login Successfull");
                    res.redirect("/dashboard");
                    
                        
                }else{
                    console.log("Wrong Password");
                    req.flash("errPass","Incorrect or Wrong Password");
                    res.redirect("/Login");
                }
            }
        
        
        }
        catch(error){
          console.log("Failed to Log in",error);
        }
    }

    const mail_confirmation = async(req,res)=>{
        try{
            console.log("Received mail from Confirmation mail: ",req.params.email);
            console.log("Received token from params: ", req.params.token);
            let userToken = await TokenModel.findOne({token: req.params.token});
    
            if(userToken){
            let user_data = await authModel.findOne({email:req.params.email});
            //console.log("Details of the user whose mail verification is Conducting: ",user_data);
            if(user_data.isVerified){
                console.log("User already Verified");
                res.send("Your Mail is Already Verifiled");
            }else{
                user_data.isVerified = true;
                let save_res = await user_data.save();
                if(save_res){
                    console.log("Your Account Successfully Verified");
                    res.redirect("/Login");
    
                }
            }
        }else{
            console.log("Token link Expires");
        }
            
        }catch(error){
            console.log("Error in Email Verification Process ",error);
        }
    }

const getDashBoard = (req,res)=>{
    
    res.render("Auth/dashBoard",{
        title:'DashBoard Page',
        
    })
}

const userAuth = async(req,res,next)=>{
    try{
        console.log("User Details: ",req.user);
        if(req.user){
            next();
        }else{
            console.log("You need to login first");
            res.redirect("/login");
        }

    }catch(error){
         throw error;
    }

}

const getBlog = (req,res)=>{
    let user_Data = req.user.userData;
    console.log("The user Details got from the Token: ",user_Data);
    res.render("userBlog/CreateBlog",{
        title:'Blogs Site',
        data:user_Data
    })
}

const postBlog = async(req,res)=>{
    try{
        //console.log('The Blog details Collected From the Blog Page: ',req.body,req.files);
        let arr = req.files.map((value)=>{

            return value.originalname;

        })
        console.log("The array value: ",arr);
        let formData = new blogModel({
            title:req.body.blogTitle,
            description:req.body.blogDescription,
            userEmail: req.body.email,
            image: arr
        })
        
        let Saved = await formData.save();
        if (Saved){
            console.log("Product Data is saved");
        }
        
        res.redirect("/viewBlog");

    }catch(error){

    }
}

const getViewBlog = async(req,res)=>{
    let user_Data = req.user.userData;
    console.log("The user Details got from the Token: ",user_Data);
    let Tokenemail = user_Data.email;
    console.log("email got from Token: ",Tokenemail);
    let blogDetails = await blogModel.aggregate([
        {
            $match: { userEmail:Tokenemail }
        }
    ])
    console.log("The Blog details ",blogDetails);
    res.render("userBlog/viewBlog",{
        title:'Blog Details',
        data: blogDetails
    });
}

const logOut = async(req,res)=>{
    try{
        await res.clearCookie("token_Data");
        res.redirect("/login");
        console.log("Log out successfull");
    }catch(error){
        console.log("Failed to LogOut ",error);
    }
}
    
    
module.exports = {getSignup,postSignup,getLogin,postLogin,mail_confirmation,getDashBoard,getBlog,postBlog,getViewBlog,userAuth,logOut};
