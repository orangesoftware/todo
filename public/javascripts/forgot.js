
document.querySelector('#btnVerificationCode').addEventListener('click', function() {
  
  const email = document.querySelector('#email').value;
  if (email === '') {
    showMessages('Email is required', 'message', 'warning');
    return;
  }
  const data = {email};

  debugger;
   
  
  fetch('/create-opt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(response => {
    return response.json();
  })
  .then(data => {
    if (data.status === 'success') {
      debugger;
      showMessages(data.message, 'message', 'success')
      .then((msg) =>{
        document.querySelector("#opt-verification").innerHTML = data.template;
      }).catch((error) => {
        console.error(error);
      });
      
    } else {
      debugger;
      showMessages(data.message, 'message', 'warning');
    }
    })
    .catch(error => {
      debugger;
        console.error('Error:', error);
    });
  
});
