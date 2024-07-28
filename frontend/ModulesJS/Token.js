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
	const json = JSON.stringify({ token: token });
	if (!token) return false;
	try {
		const response = await fetch(`https://45.157.16.17:8080/api/token/verify/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
				'Authorization': `Bearer ${localStorage.getItem('access')}`,
			},
			body: json
		});
		console.log(response);
		if (!response.ok) {
			console.log("Token expired");
			localStorage.removeItem('access');
			if (await refreshTokenGenerate()){
				console.log("Token refreshed");
				return true;
			}
			document.querySelector('my-navbar').setAttribute('active', false);
			return false;
		} else {
			return true;
		}

	} catch (error) { return; }
}