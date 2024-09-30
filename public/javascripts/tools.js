
const renderPart = (url, method, data) => {
  return new Promise((resolve,reject) => {
    const TOKEN = sessionStorage.getItem('token');
    if (!TOKEN) {
      window.location.href = "/";
      return
    }

    let options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }};

    if (method !== "GET") {
      options.body = JSON.stringify(data);
    }
      
    fetch(url, options).then(response => {
      return response.text();
    }).then(data => {
      resolve(data);
    }).catch(err => {
      reject(err);
    });
  });
};

const callApi = (url, method, data) => {
    return new Promise((resolve,reject) => {
      const TOKEN = sessionStorage.getItem('token');
      if (!TOKEN) {
        window.location.href = "/";
        return
      }
  
      let options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }};
  
      if (method !== "GET") {
        options.body = JSON.stringify(data);
      }
        
      fetch(url, options).then(response => {
        return response.json();
      }).then(data => {
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  };
  

  const isNullorUndefined = ((value,defaultValue) => {

    if (value === null || value === undefined){
        return defaultValue || "";
    }
    return value;
  });

  const showMessages = ((messages,idElement,className) => {
    className = className || "danger";
  
    let elementId = idElement.startsWith("#") ? idElement : `#${idElement}`;
    let element = document.querySelector(`${elementId}`);
  
    element.innerHTML = messages;
    element.classList.remove('hidden');
    element.classList.add(className);
    return new Promise((resolve) => {
      setTimeout(() => {
        element.innerHTML = "";
        element.classList.add('hidden');
        element.classList.remove(className);
        resolve("done");
    }, 3000);
    });
  });


  const cleanForm = (formId) => {    
    let form = document.querySelector(formId);
    form.reset();
  };