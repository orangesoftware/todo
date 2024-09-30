var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const emailTokenExpiration = 60 * 10; // 10 minutes

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/passwords", function(req, res, next) {
  res.send("Passwords route");

});

router.get("passwords/:id", function(req, res, next) {
  res.send("Passwords route");
});


router.post("/settings",async function(req, res, next) {
  let  {mobile, twoFA, byEmail, enableNotifications, remainderDays} = req.body;
  let response = {"status":"success", message:"", data:[]};

  let currentUser = req.user;

  if (!byEmail && mobile === "") {
    response.status = "error";
    response.message = "Mobile number is required when by email is selected!";
  }


  if (response.status === "error") {
    res.json(response);
    return;
  }

  let createdBy = currentUser.id; // This will be the user id of the logged in user
  try{
    let settings = await userService.getSettingsByCreatedBy(createdBy);
    let isUpdate = false;
    if (settings) {
      if (mobile != settings.mobile) {
        isUpdate = true;
        settings.mobile = mobile;
      }

      if (twoFA != settings.twoFA) {
        isUpdate = true;
        settings.twoFA = twoFA;
      }

      if (byEmail != settings.byEmail) {
        isUpdate = true;
        settings.byEmail = byEmail;
      }

      if (enableNotifications != settings.enableNotifications) {
        isUpdate = true;
        settings.enableNotifications = enableNotifications;
      }

      if (remainderDays != settings.remainderDays) {
        isUpdate = true;
        settings.remainderDays = remainderDays;
      }
      if (!isUpdate) {
        response.status = "success";
        response.message = "No changes detected!";
        res.status(200).json(response);
        return
      }
      
      await userService.updateSettings(settings);

      response.status = "success";
      response.message = "Notifications settings updated successfully.";
      response.data = settings;
      res.status(200).json(response);
      return;
    }
    let setting = await userService.createSettings({mobile, twoFA, byEmail, enableNotifications, remainderDays,createdBy});

    const settingId = setting.insertId;
    setting = await userService.getSettingsById(settingId);


    response.data = setting;
   
    response.message = "Settings added successfully."; 
    response.status = "success";
    res.status(201).json(response);
  } catch (error) {
    response.status = "error";
    response.message = error;
    res.status(500).json(response);
  }
});

module.exports = router;
