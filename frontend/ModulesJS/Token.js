import triggerNavbar from "./TriggerNavbar.js";

export default async function tokenCntrl() {
    const token = localStorage.getItem('access_token');
    const json = JSON.stringify( { token: token } );
    if (!token) return false;
    try {
        const response = await fetch(`https://45.157.16.17:8080/verify-token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
            },
            body: json
        });
        if (!response.ok) {
            document.querySelector('my-navbar').setAttribute('active', false);
            localStorage.removeItem('access_token');
            return false;
        } else {
            return true;
        }

    }catch(error) {console.error(error); return false;}
}