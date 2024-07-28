async function refreshTokenGenerate() {
	const response = await fetch(`https://45.157.16.17:8080/api/token/refresh/`, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify( { 'refresh': localStorage.getItem('refresh') } )
	});

	if (!response.ok) {
		return false
	}
	const data = await response.json();
	localStorage.setItem('access', data.access);
	return true;
}
export default async function tokenCntrl() {
	const token = localStorage.getItem('access');
	if (!token) return false;
	const json = JSON.stringify({ 'token': token });
	if (!json || isTokenExpired(json)) {
		document.querySelector('my-navbar').setAttribute('active', false);
		localStorage.removeItem('access');
		localStorage.removeItem('refresh')
		window.route({ target: { href: '/' } }); 
	  return false;
	}
	return true
}

// export default async function tokenCntrl() {
// 	const token = localStorage.getItem('access');
// 	const json = JSON.stringify({ token: token });
// 	if (!token) return false;
// 	try {
// 		const response = await fetch(`https://45.157.16.17:8080/api/token/verify/`, {
// 			method: 'POST',
// 			headers: {
// 				'Accept': 'application/json',
// 				'Content-Type': 'application/json',
// 				'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
// 				'Authorization': `Bearer ${localStorage.getItem('access')}`,
// 			},
// 			body: json
// 		});
// 		console.log(response);
// 		if (!response.ok) {
// 			console.log("Token expired");
// 			localStorage.removeItem('access');
// 			if (await refreshTokenGenerate()){
// 				console.log("Token refreshed");
// 				return true;
// 			}
// 			document.querySelector('my-navbar').setAttribute('active', false);
// 			return false;
// 		} else {
// 			return true;
// 		}

// 	} catch (error) { return; }
// }


function getToken() {
	return localStorage.getItem('access');
  }
  

function parseJwt(token) {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		return JSON.parse(jsonPayload);
	} catch (e) {
		return null;
	}
	}

function isTokenExpired(token) {
	const decodedToken = parseJwt(token);
	if (!decodedToken) {
		return true;
	}
	const currentTime = Math.floor(Date.now() / 1000);
	return decodedToken.exp < currentTime;
}
  

// export function makeAuthenticatedRequest(url, method = 'GET', body = null) {
// 	const token = getToken();
  
// 	if (!token || isTokenExpired(token)) {
// 	  console.error('Token is either missing or expired');
// 	  // Token yenileme işlemi 
// 	  return;
// 	}
  
// 	const headers = new Headers({
// 	  'Authorization': 'Bearer ' + token,
// 	  'Content-Type': 'application/json'
// 	});
  
// 	fetch(url, {
// 	  method: method,
// 	  headers: headers,
// 	  body: body ? JSON.stringify(body) : null
// 	})
// 	.then(response => {
// 	  if (!response.ok) {
// 		throw new Error('Network response was not ok ' + response.statusText);
// 	  }
// 	  return response.json();
// 	})
// 	.then(data => {
// 	  console.log(data);
// 	})
// 	.catch(error => {
// 	  console.error('There has been a problem with your fetch operation:', error);
// 	});
//   }



