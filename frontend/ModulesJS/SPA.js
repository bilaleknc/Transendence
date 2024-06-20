import HTMLTemplate from "./HTMLTemplate.js";

class SPA {
  urlRoutes = {
    404: {
      template: "/templates/404.html",
      title: "404",
      description: "",
    },
    "/": {
      template: "/templates/home.html",
      title: "home",
      description: "Ana Sayfa",
    },
    "/game": {
      template: "/templates/game.html",
      title: "game",
      description: "Oyun Sayfası",
    },
    "/live-chat": {
      template: "/templates/live-chat.html",
      title: "live-chat",
      description: "Canlı mesajlaşma",
    },
    "/sign-up": {
      template: "/templates/sign-up.html",
      title: "sign-up",
      description: "üye ol",
    },
    "/loading": {
      template: "/templates/loading.html",
      title: "loading",
      description: "Load",
    },
  };

  dom_main = document.querySelector("main");

  constructor() {
    document.addEventListener("click", (e) => {
      const { target } = e;
      if (target.matches("nav a"));
      else if (target.matches("a img")) e.target.parentElement.click();
      else {
        console.log("return");
        return;
      }
      e.preventDefault();
      this.urlRoute(e);
    });

    window.onpopstate = this.urlLocationHandler.bind(this);
    window.route = this.urlRoute.bind(this);
    this.urlLocationHandler();
  }

  urlRoute(event) {
    if (event.preventDefault) event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    console.log("selamssadsaas")
    this.urlLocationHandler();
  }

  checkAuth(location) {
    if (location == "/game") {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        alert("Oyun oynamak için giriş yapmalısınız.");
        location = "/";
        return false;
      }
    }
	  return true;
  }

  async urlLocationHandler() {
    let location = window.location.pathname;
    if (this.checkAuth(location) == false) return;
    
    if (location.length == 0) location = "/";
    const route = this.urlRoutes[location] || this.urlRoutes["404"];
    const temp_href = new HTMLTemplate(route.title);
    const load = new HTMLTemplate(this.urlRoutes["/loading"].title);
    load.bindingToElement(this.dom_main);
    let self = this;
    setTimeout(() => {
      temp_href.bindingToElement(self.dom_main);
      document.title = route.title + " Ft_transdance";
      document
      .querySelector('meta[name="description"]')
      .setAttribute("content", route.description);
    }, 500);
  }

  static route(href) {
    window.location.pathname = href;
    this.urlLocationHandler();
  }
}

export default new SPA();
