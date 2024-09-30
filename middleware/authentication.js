const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const exceptionPaths = [
    "/login", 
    "/signup",
    "/register",
    "/forgot",
    "/create-opt",
    "/",
    "/api/v1/users/logout",
    '/api/v1/logout/'
];
const exceptionExtensions = ["css", "js", "png", "jpg", "jpeg", "ico", "svg", "json", "xml", "txt", "html", "ejs"];
const authentication= async (req, res, next) => {
let token = req.headers.authorization; // first check the headers

if (token == null || typeof(token) == "undefined") {
  token = req?.cookies?.token; // check the cookies
}
  if (exceptionPaths.includes(req.path)
     || exceptionExtensions.includes(req.path.split('.').pop())) {
    return next();
  }
  
  if (!token) {
    //res.redirect('/');
    return res.status(401).json({ message: 'Access denied, token is missing!' });
  }
  try {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await  userService.getUserByEmail(decoded.user);
    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired!' });
      //res.redirect('/');
    }
    else{
        return res.status(401).json({ message: 'Invalid token!' });
    }
  }
};

exports.authentication = authentication;