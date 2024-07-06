import ErrorUtils from "../ModulesJS/ErrorUtils.js";
import TriggerNavbar from "../ModulesJS/TriggerNavbar.js";

class SocialMedia extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
    <div class="container mt-5" style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <div class="row justify-content-center">
        <div class="col-lg-12">
            <div class="row">
                <!-- Kullanıcı Listesi -->
                <div class="col-md-6" style="height: auto;">
                    <div class="card shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title">All Users</h5>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">Status</th>
                                            <th scope="col">Image</th>
                                            <th scope="col">Username</th>
                                            <th scope="col">Profile</th>
                                        </tr>
                                    </thead>
                                    <tbody id="user-list-body">
                                        <!-- Kullanıcılar burada listelenecek -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Gönderiler -->
                <div class="col-md-6" style="height: auto;">
                    <div class="card shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Wall</h5>
                            <div class="mb-3">
                                <textarea id="post-content" class="form-control mb-2" placeholder="Mesajınız"></textarea>
                                <button id="post-submit" class="btn btn-primary w-100">Gönder</button>
                            </div>
                            <ul id="posts-list" class="list-group" style="max-height: 400px; overflow-y: auto;">
                                <!-- Gönderiler burada listelenecek -->
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Maç Geçmişi -->
            <div class="row">
                <div class="col-md-12">
                    <div class="card shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Match History</h5>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">Tarih</th>
                                            <th scope="col">Oyuncu 1</th>
                                            <th scope="col">Oyuncu 2</th>
                                            <th scope="col">Skor</th>
                                            <th scope="col">Kazanan</th>
                                        </tr>
                                    </thead>
                                    <tbody id="match-history-list">
                                        <!-- Maç geçmişi burada listelenecek -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
        this.querySelector('#post-submit').addEventListener('click', () => {
            this.postSubmit();
        });
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
    
        console.log(users);
        users.forEach(user => {
            const row = document.createElement('tr');
            if(user.is_active){
                row.innerHTML = `
                <td class="text-success">Online</td>
                <td><img src="${user.image}" style="width: 50px; height: 50px; border-radius: 50%;"></td>
                <td>${user.username}</td>
                <td><a href="https://45.157.16.17:8082/member?username=${user.username}" class="btn btn-primary">Profile</a></td>
                `;
            }
            else{
                row.innerHTML = `
                <td class="text-danger">Offline</td>
                <td><img src="${user.image}" style="width: 50px; height: 50px; border-radius: 50%;"></td>
                <td>${user.username}</td>
                <td><a href="https://45.157.16.17:8082/member?username=${user.username}" class="btn btn-primary">Profile</a></td>
                `;
            }
            userListBody.appendChild(row);
        });
    }

    async fetchMatches() {
        const response = await fetch('https://45.157.16.17:8080/get_match_history', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                'Authorization': `Token ${localStorage.getItem('access_token')}`
            },
        });

        const matches = await response.json();
        const matchHistoryList = this.querySelector('#match-history-list');
        matches.forEach(match => {
            const row = document.createElement('tr');
            const date = match.date ? new Date(match.date).toLocaleString('tr-TR') : '';
            row.innerHTML = `
                <td>${date}</td>
                <td><a href="https://45.157.16.17:8082/member?username=${match.player1}">${match.player1}</a></td>
                <td><a href="https://45.157.16.17:8082/member?username=${match.player2}">${match.player2}</a></td>
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
                "player1": "sakkus",
                "player2": "biekinci",
                "score": "1-1",
                "winner": "sakkus"
            })
        });

        console.log(response);
    }

    async fetchPosts() {
        const response = await fetch('https://45.157.16.17:8080/get_post', {
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

        const posts = await response.json();

        const postsList = this.querySelector('#posts-list');
        postsList.innerHTML = '';
        posts.forEach(post => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
             const date = post.date ? new Date(post.date).toLocaleString('tr-TR') : '';

            listItem.innerHTML = `
                <h6 class="mb-0 font-weight-bold">${post.username}</h6>
                <p class="mb-0 text-muted font-italic">${post.message}</p>
                <small class="text-muted d-block text-right">${date}</small>
            `;
            postsList.appendChild(listItem);
        });
    }

    async postSubmit() {
        const postContent = this.querySelector('#post-content').value;
        const response = await fetch('https://45.157.16.17:8080/create_post', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
            "content": postContent
        })
      });
        if (!response.ok) {
            console.error("Gönderi oluşturulamadı");
            return;
        }
        await this.fetchPosts();
        this.querySelector('#post-content').value = '';
    }
}

customElements.define('my-social-media', SocialMedia);
