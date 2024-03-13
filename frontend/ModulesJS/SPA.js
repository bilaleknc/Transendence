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
	  // 42 istanbula tıklayınca refresh oluyor
    document.addEventListener("click", (e) => {
      const { target } = e; 
      if (!target.matches("nav a") ) return;
      e.preventDefault();
      this.urlRoute();
    });

    window.onpopstate = this.urlLocationHandler;
    window.route = this.urlRoute;
    this.urlLocationHandler();
  }

  urlRoute(event) {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    this.urlLocationHandler();
  }

  async urlLocationHandler() {
    const location = window.location.pathname;
    if (location.length == 0) location = "/";


    const route = this.urlRoutes[location] || this.urlRoutes[404];
    const temp_href = new HTMLTemplate(route.title);

    await temp_href.bindingToElement(this.dom_main);
    document.title = route.title + " Ft_transdance";
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", route.description);
  }
}

export default new SPA();