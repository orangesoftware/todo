
document.querySelector('#login').addEventListener('click', function() {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const data = {email, password};
  
  fetch('/login', {
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
      sessionStorage.setItem('token', data.data.token);
        window.location.href = '/dashboard';
    } else {
      showMessages(data.message, '#message', 'warning'); 
    }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
});
