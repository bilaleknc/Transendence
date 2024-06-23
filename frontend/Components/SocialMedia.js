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

    fetchUserData() {
        // Example user data
        const users = [
            { profileImage: "https://randomuser.me/api/portraits/men/1.jpg", username: "User 1" },
            { profileImage: "https://randomuser.me/api/portraits/men/2.jpg", username: "User 2" },
            { profileImage: "https://randomuser.me/api/portraits/men/3.jpg", username: "User 3" }
        ];

        // Populate user list
        const userListBody = this.querySelector('#user-list-body');
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${user.profileImage}" alt="${user.username}" class="img-fluid rounded-circle" width="50"></td>
                <td>${user.username}</td>
                <td><button class="btn btn-primary">Profile</button></td>
            `;
            userListBody.appendChild(row);
        });
    }

    fetchMatches() {
        // Example match history data
        const matches = [
            { date: "2023-06-20", user1: "muerdoga", user2: "biekinci", score: "2-1", winner: "biekinci" },
            { date: "2023-06-21", user1: "sakkus", user2: "muerdoga", score: "0-2", winner: "sakkus" },
            { date: "2023-06-22", user1: "biekinci", user2: "muerdoga", score: "1-1", winner: "muerdoga"}

        ];

        // Populate match history
        const matchHistoryList = this.querySelector('#match-history-list');
        matches.forEach(match => {
            // bilgileri yazarken kazanan kişinin rengini değiştirmek için bir if else yapısı kullan
            // kazanını yeşil renkte yaz
            // kaybeden kişiyi kırmızı renkte yaz
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${match.date}</td>
            `;
            if (match.winner == match.user1) {
                row.innerHTML += `
                    <td style="color: green;">${match.user1}</td>
                    <td style="color: red;">${match.user2}</td>
                `;
            }
            else if (match.winner == match.user2) {
                row.innerHTML += `
                    <td style="color: red;">${match.user1}</td>
                    <td style="color: green;">${match.user2}</td>
                `;
            }
            else {
                row.innerHTML += `
                    <td>${match.user1}</td>
                    <td>${match.user2}</td>
                `;
            }
            row.innerHTML += `
                <td>${match.score}</td>
            `;
            matchHistoryList.appendChild(row);
          });
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
