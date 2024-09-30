var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const taskService = require('../services/taskService'); 
//const emailTokenExpiration = 60 * 10; // 10 minutes
const EXPIRATION_MINUTES = 10;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: '' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: '' });
});

router.get('/forgot', function(req, res, next) {
  res.render('forgot', { title: '' });
});

router.post('/create-opt',async function(req, res, next) {
  const {email} = req.body;

  if (typeof(email) == "undefined" || email === '') {
    res.status(400).json({status: "error", message: "Email is required"});
    return;
  }

  let user =  await userService.getUserByEmail(email);
  if (!user) {
    res.status(404).json({status: "error", message: "Invalid email"});
    return
  }
  let optCode =  user.optCode || "";
  if (user.optCode !== "") {
    let optExpiration = new Date(user.expiration);
    let now = new Date();
    //if (now > optExpiration) {
    //  res.status(200).json({status: "success", message: "Opt code expired"});
     // return;
   // }
  }

  optCode = crypto.randomInt(100000, 999999);
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 10);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your 2FA Code',
    text: `Your 2FA verification code is: ${optCode}. It will expire at ${expiration}`,
    html: `<p>Your 2FA verification code is: <strong>${optCode}</strong>. It will expire at ${EXPIRATION_MINUTES} minutes</p>`

  };

  transporter.sendMail(mailOptions,async  function(error, info){
    if (error) {
      console.log(error);
      res.status(500).json({status: "error", message: "Failed to send email"});
    } else {
      //let id = -1;
      await userService.updateOptCode({email, optCode, expiration:EXPIRATION_MINUTES});
      console.log('Email sent: ' + info.response);
      let template =`
        <form>
          <label for="email">Verification Code</label>
          <input id="email" type="text" readonly value="${email}"/>
          <label for="optVerification">Verification Code</label>
          <input id="optVerification" type="text"/>
          <button id="btnVerifyOpt" class="button primary">Verify</button>
        </form>
        `;
      
      res.status(200).json({status: "success", message: "Email sent successfully",template});
    }
  });

});

router.post('/verify-opt', function(req, res, next) {
  const {email, opt} = req.body;

  // Check if the opt is valid
  // Check if the opt is expired
  // If valid and not expired, log the user in
  // If valid and expired, send a new opt
  // If invalid, return an error message

  res.status(200).json({status: "success", message: "Email sent successfully"});
});


router.get("/task", async (req, res, next) => {  
  let task = await taskService.getTaskByCreatedBy(req.user.id);
  res.render('task', {task:task});
});

router.get("/task/:taskId", async (req, res, next) => {  
  let taskId = req.params.taskId;
  taskId = taskId || -1;
  if (taskId == -1) {
    res.render('taskEdit', {task:{}});
    return;
  }
  let task = await taskService.getTaskById(taskId);
  res.render('taskEdit', {task:task});
});

router.get("/settings", async (req, res, next) => {
  let currentUser = req.user;
  let setting = await userService.getSettingsByCreatedBy(currentUser.id);
  if ( typeof(setting) == "undefined") {
    setting = {};
  }
  res.render('settings', {setting:setting});
});

router.post("/login", async (req, res, next) => {
  let response = {"status":"success", message:"", data:[]};
  const { email,password} = req.body;

  if (typeof(email) == "undefined" || email === "") {
    response.status = "error";
    response.message = "Emails is required";
    res.status(404).json(response);
    return;
  }

  if (typeof(password) == "undefined" || password === "") {
    response.status = "error";
    response.message = "Password is required";
    res.status(404).json(response);
    return;
  }

  const user = await userService.getUserByEmail(email);

  if (!user) {
    response.status = "error";
    response.message = "User not found";
    res.status(404).json(response);
    return;
  }
  
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    response.status = "error";
    response.message = "Invalid credentials";
    res.status(401).json(response);
    return;
  }
//  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  const token = jwt.sign({user: user.email}, process.env.JWT_SECRET, {expiresIn: '1h'});
  response.data = {token};
  response.status = "success";
  
  res.cookie('token', token, {
    httpOnly: true,      // HTTP-only means it can't be accessed via JavaScript
    secure: false,       // Set to true if using HTTPS in production
    sameSite: 'lax',  // Prevent CSRF
    maxAge: 3600000      // 1 hour
  });

  
  res.status(200).json(response);
  
  
});


router.post("/register", async (req, res, next)=> {
  const { email,confirmEmail,name, lastName,password,confirmPassword } = req.body;
  let response = {"status":"success", message:"", data:[]};

  if (email !== confirmEmail) {
    response.status = "error";
    response.message = "Emails do not match";
  }

  if (password !== confirmPassword) {
    response.status = "error";
    response.message = "Passwords do not match";
  }

  if (name === "") {
    response.status = "error";
    response.message = "Name is required";
  }
  if (response.status === "error") {
    res.json(response);
    return;
  }

  let createdBy = 1; // This will be the user id of the logged in user
  try{
    
    const user = await userService.getUserByEmail(email);
    if (user) {
      response.status = "error";
      response.message = "User already exists";
      res.status(409).json(response);
      return;
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await userService.createUser({email,name,lastName,hashedPassword,createdBy});

    //const confirmationToken = jwt.sign({user: email}, process.env.JWT_SECRET, {expiresIn: emailTokenExpiration});  

    //sendConfirmationEmail(email, confirmationToken);

   // response.data = result;      
    response.message = "User created successfully. Please check your email to confirm your account."; 
    response.status = "success";
    res.status(201).json(response);
  } catch (error) {
    response.status = "error";
    response.message = error;
    res.status(500).json(response);
  }
  
});

router.post("/logout", async (req, res, next) => {
  res.clearCookie('token');

  res.status(200).json({status: "success", message: "User logged out successfully"});
});



module.exports = router;
