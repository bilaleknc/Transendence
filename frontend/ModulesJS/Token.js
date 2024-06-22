export default async function tokenCntrl() {
    const token = localStorage.getItem('access_token');
    const json = JSON.stringify( { token: token } );
    try {
        const response = await fetch(`https://localhost:8080/verify-token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
            },
            body: json
        });
        if (!response.ok) {
            return false;
        } else {
            return true;
        }

    }catch(error) {console.error(error)}
}