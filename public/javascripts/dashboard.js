const API_URL = "http://localhost:3000/api/v1/";



const hideFormTask = () => {
    document.querySelector("#wrapper").innerHTML = "";
};

/*
const showTaskForm = () =>{
    return new Promise((resolve,reject) => {
        try{
            let taskWrapper = document.querySelector('#taskWrapper');
            let whatClass = taskWrapper.classList;

            if (whatClass.contains('showTodo')) {
                taskWrapper.classList.remove('showTodo');
                taskWrapper.classList.add('hideTodo');
                resolve("hidding");
            }
            else{
                taskWrapper.classList.remove('hideTodo');
                taskWrapper.classList.add('showTodo');
                resolve("showing");
            }
        } catch (err) {
            reject(err);
        }
    });
}
*/

const addTask = () => {
    let title = isNullorUndefined(document.querySelector("#title").value);
    let description = isNullorUndefined(document.querySelector("#description").value);
    let date = isNullorUndefined(document.querySelector("#date").value);
    let priority = isNullorUndefined(document.querySelector("#priority").value);
    let status = isNullorUndefined(document.querySelector("#status").value);
    let id = isNullorUndefined(document.querySelector("#id").value,"-1");
    let task = {id,title, description, dueDate:date, priority, status};
    debugger;
    if (title == "") {
        showMessages("Title is required", "#message", "warning");
        return;
    }

    callApi(API_URL + "task/", "POST", task)
    .then(data => {
        if (data?.status == "success") {
            showMessages("Task added successfully", "#message", "success")
            .then(() => {
                cleanForm("#frmTask");
            });
        }
        console.log(data);
    })
    .catch(err => {                 
        showMessages("An error occurred", "#message", "danger");
        console.log(err); 
    }); 
};



document.querySelector("#tabTask").addEventListener("click", function(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let dataTarget = element.getAttribute("data-target")
    let targetElement = document.querySelector(dataTarget);
    let endPoint = element.getAttribute("href")

   /* 
    showTaskForm()
    .then(option => {
        */
        let taskForm = document.querySelector("#frmTask") || "undefined";
        let theId = "-1";
        if (/*option == "showing" && */
            taskForm != "undefined" &&
            taskForm.querySelector("#id") != "undefined"
        ) {
            theId = taskForm.querySelector("#id").value;
        }
        if (theId != "-1") {
            return;
        }
        loadFormTask(endPoint,targetElement); //todo
        /*
    })
    .catch(err => {
        console.log(err);
    });
    */
});

const saveSettings = () => {
    let mobile = isNullorUndefined(document.querySelector("#mobile").value);
    let twoFA = document.querySelector("#twoFA").checked || false;
    let byEmail = document.querySelector("#byEmail").checked || false;
    let enableNotifications = document.querySelector("#enableNotifications").checked || false;
    let remainderDays = isNullorUndefined(document.querySelector("#remainderDays").value);
    let settings = {mobile, twoFA, byEmail, enableNotifications, remainderDays};

    callApi(API_URL + "users/settings/", "POST", settings)
    .then(data => {
        debugger;
        if (data?.status == "success") {
            showMessages(data.message, "#message", "success");
            let form = document.querySelector("#frmSetting");
            form.querySelector("#id").value = data.data.id;
           // .then(() => {
           //     cleanForm("#frmSetting");
           // });
        }
        else{
            showMessages(data.message, "#message", "warning");
        }
        console.log(data);
    })
    .catch(err => {                 
        showMessages("An error occurred", "#message", "danger");
        console.log(err); 
    }); 
};


document.querySelector("#logout").addEventListener("click", function() {
    let message = document.querySelector(".session-message");
    message.innerHTML = "Closing session...";
    message.classList.remove("hidden");
    message.classList.add("showCloseSession");
    
    //document.querySelector(".session-message").classList.remove("hidden");  
    
    callApi("/logout", "POST", {})
    .then(data => {
        sessionStorage.removeItem("token");
        window.location.href = "/";
        message.classList.remove("showCloseSession");
        message.classList.add("hideCloseSession");
    }).catch(err => {                 
        console.log(err); 
    });
       
    
    
});

const loadListTask = (endPoint, targetElement) => {
    renderPart(endPoint, "GET", {})
    .then(data => {

        targetElement.innerHTML = data;
        let links = document.querySelectorAll(".listOfTask");

        links.forEach(link => {
            link.addEventListener("click", function(event) {
                event.preventDefault();
                let element = event.currentTarget;
                let dataTarget = element.getAttribute("data-target")
                let targetElement = document.querySelector(dataTarget);
                let endPoint = element.getAttribute("href")
                loadFormTask(endPoint,targetElement);
            });
        });
    }).catch(err => {                 
        console.log(err); 
    });
};

const loadFormTask = ((endPoint,targetElement) => {
    renderPart(endPoint, "GET", {})
    .then(data => {
        targetElement.innerHTML = data;
        // Add event listeners
        document.querySelector("#btnCancelTask").addEventListener("click", function(event) {
            event.preventDefault();
            let element = event.currentTarget;
            let dataTarget = element.getAttribute("data-target")
            let targetElement = document.querySelector(dataTarget);
            let endPoint = element.getAttribute("href")
            hideFormTask();
            loadListTask(endPoint, targetElement);
        });
        
        document.querySelector("#btnAddTask").addEventListener("click", function() {
            addTask();
        });
    }).catch(err => {                 
        console.log(err); 
    });
});

document.querySelector("a[href='/task']").addEventListener("click", function(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let dataTarget = element.getAttribute("data-target")
    let targetElement = document.querySelector(dataTarget);
    let endPoint = element.getAttribute("href")
    loadListTask(endPoint, targetElement);  
});

document.querySelector("a[href='/settings']").addEventListener("click", function(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let dataTarget = element.getAttribute("data-target")
    let targetElement = document.querySelector(dataTarget);
    let endPoint = element.getAttribute("href");
    renderPart(endPoint, "GET", {})
    .then(data => {
        targetElement.innerHTML = data;
        document.querySelector("#btnAddSetting").addEventListener("click", function() {
            saveSettings();
        });

        document.querySelector("#btnCancelSetting").addEventListener("click", function() {
            targetElement.innerHTML = "";
            cleanForm("#frmSetting");
        });
    }).catch(err => {
        console.log(err);
    });
});

/*
Enable notifications
if ("Notification" in window) {
    Notification.requestPermission()
    .then(permission => {
        if (permission == "granted") {
            alert("Notifications enabled");
            location.reload();
        }
    });
}
*/