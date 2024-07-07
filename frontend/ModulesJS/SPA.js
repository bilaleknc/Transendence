import error from "./ErrorUtils.js";
import HTMLTemplate from "./HTMLTemplate.js";
import tokenCntrl from "./Token.js";

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
    "/sign-up": {
      template: "/templates/sign-up.html",
      title: "sign-up",
      description: "üye ol",
    },
    "/profile": {
      template: "/templates/profile.html",
      title: "profile",
      description: "Profil",
    },
    "/loading": {
      template: "/templates/loading.html",
      title: "loading",
      description: "Load",
    },
    "/api42": {
      template: "/templates/api42.html",
      title: "api42",
      description: "Api Connnect",
    },
    "/member": {
      template: "/templates/member.html",
      title: "member",
      description: "Member",
    },
    "/social-media": {
      template: "/templates/social-media.html",
      title: "social-media",
      description: "Social Media",
    },
    "/game-rooms": {
      template: "/templates/game-rooms.html",
      title: "game-rooms",
      description: "Game Rooms",
    },
    "/tournament": {
      template: "/templates/tournament.html",
      title: "tournament",
      description: "Tournament",
    },
  };

  authLocation = ["/game", "/profile", "/game-rooms", "/member", "/social-media" ];

  dom_main = document.querySelector("main");

  constructor() {
    document.addEventListener("click", (e) => {
      const { target } = e;
      if (target.matches("nav a"));
      else if (target.matches("a img")) e.target.parentElement.click();
      else {
        return;
      }
      e.preventDefault();
      this.urlRoute(e);
    });

    this.time_id = null;
    window.onpopstate = this.urlLocationHandler.bind(this);
    window.route = this.urlRoute.bind(this);
    this.urlLocationHandler();
  }

  urlRoute(event) {
    if (event.preventDefault) event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    this.urlLocationHandler();
  }

  async checkAuth(location) {
    if (this.authLocation.includes(location)) {
      return await tokenCntrl();
    }
    return true;
  }

  async urlLocationHandler() {
    let location = window.location.pathname;
    clearTimeout(this.time_id)
    if (await this.checkAuth(location) == false) {
      window.route({ target: { href: '/loading' } });
      this.time_id = setTimeout(() => {
        window.route({ target: { href: '/' } });
      }, 4000);
      setTimeout(() => {
        error.call(document, {"Error": "Please login"}, 0)
      }, 600);
      return;
    }
    if (location.length == 0) location = "/";
    const route = this.urlRoutes[location] || this.urlRoutes["404"];
    const temp_href = new HTMLTemplate(route.title);
    console.log(route);
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
}

export default new SPA();
