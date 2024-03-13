class Navbar extends HTMLElement {
 constructor() {
    super();
    this.innerHTML = `
    <nav class="navbar navbar-expand-xl navbar-dark bg-dark border-bottom">
    <a class="navbar-brand" href="/">
        <img src="../Public/logo.png" class="p-1 mx-3" width="120" height="50" alt="">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse navbarNavAltMarkup">
        <form class="mr-3" style="width: 250px;">
            <input type="search" class="form-control rounded" placeholder="Find a friend"
            aria-label="Search" aria-describedby="search-addon" />
        </form>
        <ul class="navbar-nav">
            <li class="nav-item active">
                <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/game">Game</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/live-chat">Live Chat</a>
            </li>
            <li class="nav-item dropdown">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="bi bi-person"></span>
                    </a>
                    <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        <a class="dropdown-item" href="/sign-in">Sign In</a>
                        <a class="dropdown-item" href="/sign-up">Sign Up</a>
                    </div>
                </li>
            </li>
        </ul>
    </div>
    </div>
</nav>
    `
 }   
}

customElements.define('my-navbar', Navbar);