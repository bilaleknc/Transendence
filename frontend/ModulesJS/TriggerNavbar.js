import tokenCntrl from "./Token.js";

export default function triggerNavbar () {
    tokenCntrl()
    .then((flag) => {
        if (flag) {
            document.querySelector('my-navbar').setAttribute('active', true);
        }else {
			localStorage.removeItem("access");
			localStorage.removeItem("refresh");
			localStorage.removeItem("username");
			localStorage.removeItem("room");
            document.querySelector('my-navbar').setAttribute('active', false);
        }
    })
}