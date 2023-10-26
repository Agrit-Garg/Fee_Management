const express =require("express");
let ejs = require('ejs');
const admin_route= express();

const session = require("express-session");
const config = require("../config/config");
admin_route.use(session({secret:config.sessionSecret}));

const auth=require("../middleware/adminauth");

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const bodyParser =require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));
admin_route.use("/public",express.static("public"));


const adminController = require("../controllers/adminController");
// admin_route.get('/admin',auth.isLogout,adminController.loadHome);
// admin_route.get('/index',auth.isLogout,adminController.loadHome);
admin_route.get('/register',auth.isLogout,adminController.loadRegister);
admin_route.post('/register',adminController.insertAdmin);
admin_route.get('/login',auth.isLogout,adminController.loadLogin);
admin_route.post('/login',auth.isLogout,adminController.verifyLogin);

admin_route.get('/viewstudents',auth.isLogin,adminController.loadViewStudents);
admin_route.post('/viewstudents',auth.isLogin,adminController.loadViewStudents);


admin_route.get('/updatestudent',auth.isLogin,adminController.updateStudent);
admin_route.post('/updatestudent',auth.isLogin,adminController.updateStudentFees);


admin_route.get('/logout',auth.isLogin,adminController.adminLogout);

admin_route.get('/homelogin',auth.isLogin,adminController.loadHomeLogin);


admin_route.get('/sendemail',auth.isLogin,adminController.sendEmailToStudents);

admin_route.get('*',function(req,res){
    res.redirect('/admin')
})





module.exports = admin_route;  
