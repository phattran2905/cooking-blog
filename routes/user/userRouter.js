const express = require('express');
const userRouter = express.Router();
// const Passport = require('passport').Passport;
const passport = require('../../server').passport;
const session = require('express-session');
const userPassport = require('../../passports/userPassport');

const indexRouter = require('./indexRouter');
const authRouter = require('./authRouter');

// const moduleObjects = {passport};
// userRouter.use(session({
//     name: 'client_sid',
//     secret: "secret_key for @user_session",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         name: 'user_sessionID',
//         path: '/',
//         maxAge: 24*3600*1000*7,
//         sameSite: true,
//     }
// }));
// userRouter.use(userPassport.initialize());
// userRouter.use(userPassport.session());
// userPassportSetup(passport);

// indexRouter(userRouter, {passport: userPassport});
// authRouter(userRouter, {passport: userPassport});
indexRouter(userRouter, {passport: passport});
authRouter(userRouter, {passport: passport});

module.exports = userRouter;