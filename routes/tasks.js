var express = require('express');
const taskService = require('../services/taskService');

var router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  let response = {"status":"success", message:"", data:[]};
  
  let currentUser = req.user;
  let createdBy = currentUser.id; 
  try{
    const task = await taskService.getTaskByCreatedBy(createdBy);
    response.data = task;
    response.message = "";
    response.status = "success";
    res.status(200).json(response);
  } catch (error) {
    response.status = "error";
    response.message = error.message;
    res.status(500).json(response);
  }

});

//register task
router.post("/", async (req, res, next)=> {
  const {id, title,description,dueDate, priority,status } = req.body;
  let response = {"status":"success", message:"", data:[]};

 /*
  task.title
  , task.description
  , task.dueDate
  , task.priority
  , task.createdBy
  */

  if (typeof(title) != "undefined" && title == "") {
    response.status = "error";
    response.message = "Title is required";
  }
  let currentUser = req.user;

  let createdBy = currentUser.id; // This will be the user id of the logged in user
  let taskId = id;
  try{
   if (typeof(id) != "undefined" && id == "-1") {
    const result = await taskService.createTask({title,description,dueDate, priority,status, createdBy});
    taskId = result.insertId;
   } else{
    const result = await taskService.updateTask({id, title,description,dueDate, priority,status, createdBy});
   }

    const task = await taskService.getTaskById(taskId);

    response.data = task;      
    response.message = ""; 
    response.status = "success";
    res.status(201).json(response);
  } catch (error) {
    response.status = "error";
    response.message = error.message;
    res.status(500).json(response);
  }
  
});


module.exports = router;
