
document.querySelector('#register').addEventListener('click', function() {
  debugger;
  const email = document.querySelector('#email').value;
  const confirmEmail = document.querySelector('#confirmEmail').value;
  const name = document.querySelector('#name').value;
  const lastName = document.querySelector('#lastName').value;
  const password = document.querySelector('#password').value;
  const confirmPassword = document.querySelector('#confirmPassword').value;
  
  const data = {email, confirmEmail, name, lastName, password,confirmPassword};
  
  fetch('/register', {
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
      .then((data) =>{
        window.location.href = '/';
      }).catch((error) => {
        console.error(error);
      });
      
    } else {
      showMessages(data.message, 'message', 'warning');
    }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
});
