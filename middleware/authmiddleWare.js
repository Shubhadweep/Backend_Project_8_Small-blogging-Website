const jwt = require('jsonwebtoken');

class jwtAuth{
    async authJWT(req,res,next){
        try{

            console.log("middleware",req.cookies.token_Data);
        if(req.cookies && req.cookies.token_Data){
            jwt.verify(req.cookies.token_Data,process.env.SECRET_KEY,(error,data)=>{
                console.log("Verify Cookie Data: ",data);
                req.user = data;
                next();
            })
        }else{
            next();
        }

        }catch(error){
            console.log("Error to verify Token: ",error);
        }
    }
    
}

module.exports = new jwtAuth();