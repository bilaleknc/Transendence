import tokenCntrl from "./Token.js";

export default function triggerNavbar () {
    tokenCntrl()
    .then((flag) => {
        if (flag) {
            document.querySelector('my-navbar').setAttribute('active', true);
        }else {
            console.log("false");
            document.querySelector('my-navbar').setAttribute('active', false);
        }
    })
}