var express = require('express');
var router = express.Router();

var config = require('./../fireconfig');


const functions = require('firebase-functions');
const express = require('express');
const app = express();

  import { google } from 'googleapis';

app.post('/sendSMS', function (req, res) {
  const { phoneNumber, recaptchaToken } = req.body;
  
  const identityToolkit = google.identitytoolkit({
    auth: 'GCP_API_KEY',
    version: 'v3',
  });
  
  const response = await identityToolkit.relyingparty.sendVerificationCode({
    phoneNumber,
    recaptchaToken: recaptcha,
  });
  
 // save sessionInfo into db. You will need this to verify the SMS code
 const sessionInfo = response.data.sessionInfo;
 console.log("Session info : "+sessionInfo)
 
});