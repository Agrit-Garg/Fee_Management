const express =require("express");
let ejs = require('ejs');
const user_route= express();
const path = require("path");

const session = require("express-session");
const config = require("../config/config");
user_route.use(session({secret:config.sessionSecret}));

const auth=require("../middleware/auth");

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser =require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));
// user_route.use(express.static(path.join(__dirname,'public')));
user_route.use("/public",express.static("public"));

const multer = require("multer");
// const path = require("path");

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../public/userImages"));

    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+ file.originalname;
        cb(null,name);
     }
});
const upload = multer({storage:storage});


const userController = require("../controllers/userController");
user_route.get('/',auth.isLogout,userController.loadLogin);
user_route.get('/index',auth.isLogout,userController.loadHome);
user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.get('/login',auth.isLogout,userController.loadLogin);
user_route.get('/search',userController.loadSearch);
user_route.get('/viewpage',userController.profileLoad);
user_route.get('/trackfee',auth.isLogin,userController.loadTrackfee);


user_route.post('/search',userController.loadSearch);


user_route.get('/forgetpass',auth.isLogout,userController.loadForget);
user_route.post('/forgetpass',userController.forgetVerify);
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)
user_route.post('/forget-password',userController.resetPassword)



user_route.post('/register',upload.single('image'),userController.insertUser);

user_route.get('/homelogin',auth.isLogin,userController.loadHomeLogin);

user_route.post('/login',userController.verifyLogin);

user_route.get('/logout',auth.isLogin,userController.userLogout);

user_route.get('/payfee',auth.isLogin,userController.payfee);

user_route.post('/payfee',userController.updateProfile);

user_route.get('/verify',userController.verifyMail);






// user_route.get('/',userController.loginLoad);
// user_route.get('/login',userController.loginLoad);
// user_route.post('/login',userController);

module.exports = user_route;  
