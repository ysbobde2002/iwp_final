const express = require('express');
const mysql = require("mysql")
const path = require("path")
const dotenv = require('dotenv')
var md5 = require('md5');
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var nodemailer = require('nodemailer');
const app = express();
const PORT = 5000;
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yashsantosh.bobde2020@vitstudent.ac.in',
    pass: 'Yashbobde@1'
  }
});
dotenv.config({ path: './.env'})

app.use(express.static(__dirname+'/public'));
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const publicDir = path.join(__dirname, './public')
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(publicDir))
app.use(express.urlencoded({extended: 'true'}))
app.use(express.json())
app.use(express.static("images"));
app.use(cookieParser());
var session;
app.set('view engine', 'hbs')

db.connect((error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected!")
    }
})

app.get("/", (req, res) => {
    session=req.session;
    if(session.userid){
       console.log(session.userid)
    }
    res.render("index")
})
app.get("/login", (req, res) => {
    session=req.session;
    if(session.userid){
       console.log(session.userid)
    }
    res.render("login")
})
app.get("/patienthome", (req, res) => {
    session=req.session;
    if(session.userid){
       console.log(session.userid)
    }
    res.render("patienthome")
})



app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/faq", (req, res) => {
    res.render("faq")
})
app.get("/consult", (req, res) => {
    res.render("consult")
})
app.get("/refill", (req, res) => {
    res.render("refill")
})
app.get("/doc_login", (req, res) => {
    res.render("doc_login")
})
app.get("/doc_signup", (req, res) => {
    res.render("doc_signup")
})
app.get("/cust_login", (req, res) => {
    res.render("cust_login")
})
app.get("/cust_signup", (req, res) => {
    res.render("cust_signup")
})
app.get("/store_login", (req, res) => {
    res.render("store_login")
})
app.get("/store_signup", (req, res) => {
    res.render("store_signup")
})
app.get("/team", (req, res) => {
    res.render("team")
})
app.get("/contact", (req, res) => {
    res.render("contact")
})


app.post("/auth/login", (req, res) => {    
    const {whois,email,pword} = req.body
    
    console.log(email);console.log(whois);
    console.log(pword);
    var hash = md5(pword);
    console.log(hash);
    if(whois=='dr'){
    db.query('SELECT * FROM doctor WHERE email=? AND password=?;',[email,hash], (error, result,fields) => {
        console.log(result);
        console.log(result.length);
        if(!result[0]){
            return res.render('login', {
                message: 'Wrong Credentials'
            })
        }
        else {
           
            return res.render('doc_login', {
                message: 'User Logged-In'
            })}
        
    })}
    else if(whois=='pat'){
        db.query('SELECT * FROM customer WHERE email=? AND password=?;',[email,hash], (error, result,fields) => {
            console.log(result);
            console.log(result.length);
            if(!result[0]){
                return res.render('login', {
                    message: 'Wrong Credentials'
                })
            }
            else {
                session=req.session;
                session.userid=email;
                console.log(req.session)
                return res.render('patienthome',{
                    result:result[0].email

                })}
            
        })}
    else if(whois=='phar'){
        db.query('SELECT * FROM store WHERE email=? AND password=?;',[email,hash], (error, result,fields) => {
            console.log(result);
            if(!result[0]){
                return res.render('login', {
                    message: 'Wrong Credentials'
                })
            }
            else {
                return res.render('doc_login', {
                    message: 'User Logged-In'
                })}
            
        })}
})
app.post("/auth/doc_signup", (req, res) => {   
    
    const {name,address,domain, email,phone,cname,city,password_1, password_2} = req.body
    if(password_1==password_2)
    {
        var hash = md5(password_1);
        
        db.query(`INSERT INTO doctor (name, email, password, city, address, phone, cname,domain) VALUES (?, ? ,?, ?,?, ?,?,?);`, 
        [name, email, hash, city, address, phone,cname,domain], (err, result) => {
        if(err) {
            console.log(err)
        } else {
            return res.render('doc_signup', {
                message: 'User registered!'
            })}
        })
    }
    else {
        return res.render('doc_signup', {
            message: 'Password does not match'
        })
    }     
    

var mailOptions = {
  from: 'yashsantosh.bobde2020@vitstudent.ac.in',
  to: email,
  subject: 'Welcome to Doc_Line',
  text: 'Welcome Dr.'+name+' you have successfuly registered on our website in '+domain+' specialisation' 
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});   
})

app.post("/auth/store_signup", (req, res) => {    
    const {name,address, email,phone,city,password_1, password_2} = req.body
    if(password_1==password_2)
    {
        var hash = md5(password_1);
        
        db.query(`INSERT INTO store (name, email, password, city, address, phone) VALUES (?, ? ,?, ?,?, ?);`, 
        [name, email, hash, city, address, phone], (err, result) => {
        if(err) {
            console.log(err)
        } else {
            return res.render('store_signup', {
                message: 'User registered!'
            })}
        })
    }
    else {
        return res.render('store_signup', {
            message: 'Password does not match'
        })
    }     
    

var mailOptions = {
  from: 'yashsantosh.bobde2020@vitstudent.ac.in',
  to: email,
  subject: 'Welcome to Doc_Line',
  text: 'Welcome Store '+name+' you have successfuly registered on our website in '+city+' city' 
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});  
})
app.post("/auth/cust_signup", (req, res) => {   
    
    const {name,address, email,phone,city,password_1, password_2} = req.body
    if(password_1==password_2)
    {
        var hash = md5(password_1);
        
        db.query(`INSERT INTO customer (name, email, password, city, address, phone) VALUES (?, ? ,?, ?,?, ?);`, 
        [name, email, hash, city, address, phone], (err, result) => {
        if(err) {
            console.log(err)
        } else {
            return res.render('cust_signup', {
                message: 'User registered!'
            })}
        })
    }
    else {
        return res.render('cust_signup', {
            message: 'Password does not match'
        })
    }   
    var mailOptions = {
        from: 'yashsantosh.bobde2020@vitstudent.ac.in',
        to: email,
        subject: 'Welcome to Doc_Line',
        text: 'Welcome '+name+' you have successfuly registered on our website in '+city+' city' 
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });     
})

app.listen(5000, ()=> {
    console.log("server started on port 5000")
})