const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const mongoose =require("mongoose");
const MongoClient = require('mongodb').MongoClient;

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");

// const randomstring = require("randomstring");
const config = require("../config/config");

const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('registeration');
    }
    catch (error) {
        console.log(error.message);
    }
}
const insertAdmin = async (req, res) => {

    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {
            const spassword = await securePassword(password);
            const admin = new Admin({
                empid: req.body.empid,
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mno,
                password: spassword,
                is_admin: 0,
            });
            const adminData = await admin.save();
            if (adminData) {
                // sendVerifyMail(req.body.name, req.body.email, adminData._id);
                res.render('registeration', { regsucmessage: "Your are registered Successfully." });
                // res.send("Successfully Register");
            }
            else {
                res.render('registeration', { message: "Failed to Register" });
                // res.send("Registeration Failed");

            }
        }

        else {
            res.render('registeration', { message: "Password not match" });
        }
    }
    catch (error) {
        console.log(error.message);
        var valerror = error.message.slice(24,);
        res.render('registeration', { message: valerror });
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadViewStudents = async (req, res) => {
    try {
        // var userData = await User.find({is_admin:0});
        const admNo = req.body.admno;
        const year = parseInt(req.body.year);
        const status = parseInt(req.body.status);

        console.log(admNo);
        console.log(year);
        console.log(status);


        if (admNo && year === 0 && status === 0) {
            var query = {
                admno: admNo,
                is_admin: 0
            }
        }
        else if ((admNo && year) || (admNo && status)) {
            var query = {
                admno: admNo,
                is_admin: 0
            }
        }
        else if (year && status === 0 && admNo === "") {
            var query = {
                year: year,
                is_admin: 0
            }
        }
        else if (year === 0 && status) {
            var query = {
                status: status,
                is_admin: 0
            }
        }
        else if (status && year) {
            var query = {
                status: status,
                year: year,
                is_admin: 0
            }
        }
        else {
            var query = {
                is_admin: 0
            }
        }

        // const userData = await User.find({is_admin:0});
        var userData = await User.find(query);

        res.render('viewstudents', { users: userData });
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadHomeLogin = async (req, res) => {
    try {
        const adminData = await Admin.findById({ _id: req.session.admin_id });
        res.render('homelogin', { user: adminData });//we get data of the persion whose session is created
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;


        const adminData = await Admin.findOne({ email: email });


        if (adminData) {
            const isMatch = await bcrypt.compare(password, adminData.password);//this (await) is really important because we cannot bcrypt from body.req.password

            if (isMatch) {
                req.session.admin_id = adminData._id;
                res.redirect('/admin/homelogin');
            }
            else {
                res.render('login', { message: "Password is incorrect" });
            }

        }
        else {
            res.render('login', { message: "Email and password is incorrect" })
        }
    } catch (error) {
        console.log(error.message)

    }
}

//logout
const adminLogout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/admin/login');
    } catch (error) {
        console.log(error.message);
    }
}

const updateStudent = async (req, res) => {
    try {
        const id = req.query.id;
        const userdata = await User.findById(id);


        res.render('updatestudent', { user: userdata });

    }
    catch (error) {
        console.log(error.message);
    }
}

const updateStudentFees = async (req, res) => {
    try {
        const feepaid = req.body.amount;
        const userdata = await User.findById(req.body.user_id);

        if (userdata) {
            const payment = {
                amount: feepaid,
                timestamp: new Date()
            };
            const userData = await User.findByIdAndUpdate(req.body.user_id, { $push: { paid: payment }, $inc: { feesdue: -feepaid, totalpaid: feepaid } }, { new: true });
            if (userData.feesdue == 0) {
                var stat = 3;
            }
            else if (userData.feesdue != 0 && userData.feesdue < userData.totalfees) {
                var stat = 2;
            }
            else if (userData.feesdue == userData.totalfees) {
                var stat = 1;
            }
            const updateInf = await User.updateOne({ _id: req.body.user_id }, { $set: { status: stat } });
            res.render('success', { user: userData });
        }
        else {
            console.log("Fee Not Paid")
        }
    } catch (error) {
        console.log(error.message)
    }
}

//for message
const uri = 'mongodb://localhost:27017';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: config.emailUser,
        pass: config.emailPassword
    }
});

const sendEmailToStudents = () => {
    MongoClient.connect(uri, (err, client) => {
        if (err) {
            console.log(`Error connecting to database: ${err}`);
            return;
        }

        const db = client.db('studentdb');
        const collection = db.collection('users');

        collection.find({ feesdue: { $ne: 0 } }, { name: 1, admno: 1, feesdue: 1, email: 1 }).toArray((err, docs) => {
            if (err) {
                console.log(`Error retrieving students with non-zero due: ${err}`);
                return;
            }
            if (docs.length === 0) {
                console.log(`No students found with non-zero due`);
                client.close();
                return;
            }

            docs.forEach((doc) => {
                const mailOptions = {
                    from: config.emailUser,
                    to: doc.email,
                    subject: 'Payment Reminder',
                    text: `Hello ${doc.name},\n\nYour admission number is ${doc.admno} and your due is ${doc.feesdue}.\n\nPlease pay as soon as possible.`
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(`Error sending email to ${doc.email}: ${err}`);
                        return;
                    }

                    console.log(`Email sent to ${doc.email}: ${info.response}`);
                });
            });

            client.close();
        });
    });
};


module.exports = {
    loadRegister,
    insertAdmin,
    loadLogin,
    verifyLogin,
    loadHomeLogin,
    adminLogout,
    loadViewStudents,
    updateStudent,
    updateStudentFees,
    sendEmailToStudents
}