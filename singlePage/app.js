import HTMLTemplate from "./ModulesJS/HTMLTemplate.js";
import "./ModulesJS/SPA.js";



const dom_header = document.querySelector("header");
const dom_footer = document.querySelector("footer");
const temp_navbar = new HTMLTemplate("Navbar");
const temp_footer = new HTMLTemplate("Footer");

temp_navbar.bindingToElement(dom_header);
temp_footer.bindingToElement(dom_footer);

