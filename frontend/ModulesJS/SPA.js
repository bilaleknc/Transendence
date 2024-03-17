import HTMLTemplate from "./HTMLTemplate.js";

class SPA {
  urlRoutes = {
    404: {
      template: "/templates/404.html",
      title: "404",
      description: "",
    },
    "/": {
      template: "/templates/Home.html",
      title: "home",
      description: "Ana Sayfa",
    },
    "/game": {
      template: "/templates/Game.html",
      title: "game",
      description: "Oyun Sayfası",
    },
    "/live-chat": {
      template: "/templates/Live-chat.html",
      title: "live-chat",
      description: "Canlı mesajlaşma",
    },
  };

  dom_main = document.querySelector("main");

  constructor() {
    document.addEventListener("click", (e) => {
      const { target } = e; 
      if (!target.matches("nav a") ) return;
      e.preventDefault();
      this.urlRoute();
    });
    window.onpopstate = function (event) {
      this.urlLocationHandler(event);
    }.bind(this);
    window.route = this.urlRoute.bind(this);
    this.urlLocationHandler(event);
  }

  urlRoute(event) {
    console.log("urlRoute");
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    this.urlLocationHandler();
  }

  urlLocationHandler(event) {
    console.log("urlLocation");
    const location = window.location.pathname;
    if (location.length == 0) location = "/";
    event && event.preventDefault();
    const route = this.urlRoutes[location] || this.urlRoutes[404];
    const temp_href = new HTMLTemplate(route.title);
    
    temp_href.bindingToElement(this.dom_main);
    document.title = route.title + " Ft_transdance";
    if (route.title == "game") {
      window.game = true;
    } else {
      window.game = false;
    }
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", route.description);
  }
}

export default new SPA();