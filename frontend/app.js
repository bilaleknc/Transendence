import "./ModulesJS/HTMLTemplate.js";
import "./ModulesJS/SPA.js";
import "./Components/UsAbout.js"
import "./Components/Footer.js"
import "./Components/Navbar.js"
import "./Components/Game.js"
import "./Components/SignUp.js"
import "./Components/Loading.js"
import "./Components/Profile.js"
import "./Components/Error.js"
import "./Components/Member.js"
import "./Components/GameRooms.js"
import "./Components/SocialMedia.js"
import "./Components/Api42.js"
import triggerNavbar from "./ModulesJS/TriggerNavbar.js";

console.log(localStorage.getItem('access_token'))
if (localStorage.getItem('access_token'))
    triggerNavbar();

