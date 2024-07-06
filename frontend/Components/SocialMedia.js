import ErrorUtils from "../ModulesJS/ErrorUtils.js";
import TriggerNavbar from "../ModulesJS/TriggerNavbar.js";

class SocialMedia extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="container mt-5">
                <div class="row">
                    <div class="col-lg-6 mb-4">
                        <div id="user-list" class="card shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">Users</h5>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th scope="col">Profile</th>
                                                <th scope="col">Username</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="user-list-body">
                                            <!-- User list will be populated here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 mb-4">
                        <div id="match-history" class="card shadow-sm">
                          <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col">Player 1</th>
                                        <th scope="col">Player 2</th>
                                        <th scope="col">Score</th>
                                        <th scope="col">Winner</th>
                                    </tr>
                                </thead>
                                <tbody id="match-history-list">
                                    <!-- Match history will be populated here -->
                                </tbody>
                            </table>
                          </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-3 mb-4">
                        <div id="latest-news" class="card shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">Latest News</h5>
                                <ul class="list-group" id="latest-news-list">
                                    <!-- Latest news will be populated here -->
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-9 mb-4">
                        <div id="posts" class="card shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">Posts</h5>
                                <ul class="list-group" id="posts-list">
                                    <!-- Posts will be populated here -->
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        this.fetchUserData();
        this.fetchMatches();
        this.fetchPosts();
        this.fetchLatestNews();
    }

    async fetchUserData() {
        const response = await fetch('https://45.157.16.17:8080/getuser', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                'Authorization': `Token ${localStorage.getItem('access_token')}`
              },
        });
        if (!response.ok) {
            console.error("Kullanıcı verisi alınamadı");
            return;
        }
        console.log(response);
        const users = await response.json();
    
        const userListBody = document.querySelector('#user-list-body');
        userListBody.innerHTML = '';
    
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${user.image}" alt="${user.username}" class="img-fluid rounded-circle" width="50"></td>
                <td>${user.username}</td>
                <td><a href="https://45.157.16.17:8082/member?username=${user.username}" class="btn btn-primary">Profile</a></td>
                `;
            userListBody.appendChild(row);
        });
    }

    async fetchMatches() {
        await this.fakeMatchHistoryGenerator();
        const response = await fetch('https://45.157.16.17:8080/get_match_history', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                'Authorization': `Token ${localStorage.getItem('access_token')}`
            },
        });

        console.log(response);
        const matches = await response.json();
        console.log(matches);
        const matchHistoryList = this.querySelector('#match-history-list');
        matches.forEach(match => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${match.date}</td>
                <td>${match.player1}</td>
                <td>${match.player2}</td>
                <td>${match.score}</td>
                <td>${match.winner}</td>
            `;
            matchHistoryList.appendChild(row);
        });
    }

    async fakeMatchHistoryGenerator() {
        const currentDate = new Date().toISOString();
        const response = await fetch('https://45.157.16.17:8080/add_match_history', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                'Authorization': `Token ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                "date": currentDate,
                "player1": "muerdoga",
                "player2": "test",
                "score": "37-58",
                "winner": "muerdoga"
            })
        });

        console.log(response);
    }

    fetchPosts() {
        // Example posts data
        const posts = [
            { title: "Post 1", content: "Content of post 1" },
            { title: "Post 2", content: "Content of post 2" },
            { title: "Post 3", content: "Content of post 3" }
        ];

        // Populate posts
        const postsList = this.querySelector('#posts-list');
        posts.forEach(post => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
                <h6 class="mb-0 font-weight-bold">${post.title}</h6>
                <p class="mb-0 text-muted font-italic">${post.content}</p>
            `;
            postsList.appendChild(listItem);
        });
    }

    fetchLatestNews() {
        // Example latest news data
        const latestNews = [
            { title: "News 1", description: "Description of news 1" },
            { title: "News 2", description: "Description of news 2" },
            { title: "News 3", description: "Description of news 3" }
        ];

        // Populate latest news
        const latestNewsList = this.querySelector('#latest-news-list');
        latestNews.forEach(news => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
                <h6 class="mb-0 font-weight-bold">${news.title}</h6>
                <p class="mb-0 text-muted font-italic">${news.description}</p>
            `;
            latestNewsList.appendChild(listItem);
        });
    }
}

customElements.define('my-social-media', SocialMedia);
