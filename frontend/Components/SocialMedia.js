class SocialMedia extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
    <div class="container mt-5" style="padding: 20px; border-radius: 10px;">
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
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title">Tournament Offers</h5>
                                <button id="refresh-posts" class="btn btn-warning bi bi-arrow-clockwise"></button>
                            </div>
                            <div class="mb-3">
                                <input type="text" id="post-title" class="form-control mb-2" placeholder="Title">
                                <textarea id="post-message" class="form-control mb-2" placeholder="Message"></textarea>
                                <input type="datetime-local" id="post-date" class="form-control mb-2" placeholder="Date">
                                <input type="text" id="post-location" class="form-control mb-2" placeholder="Location">
                                <input type="number" id="post-max-people" class="form-control mb-2" placeholder="Max People" min="1">
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
        this.querySelector('#refresh-posts').addEventListener('click', () => {
            this.fetchPosts();
        });
    }

    async fetchUserData() {
        const response = await fetch('https://45.157.16.17:8080/getuser', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            },
        });

        if (!response.ok) {
            return;
        }

        const users = await response.json();
        const userListBody = this.querySelector('#user-list-body');
        if (!userListBody) return;

        userListBody.innerHTML = '';

        users.forEach(user => {
            if (user.username === localStorage.getItem('username')) {
                return;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
            <td class="${user.is_active ? 'text-success' : 'text-danger'}">${user.is_active ? 'Online' : 'Offline'}</td>
            <td><img src="${user.image}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"></td>
            <td>${user.username}</td>
            <td><button class="btn btn-primary" data-username="${user.username}">Profile</button></td>
            `;
            userListBody.appendChild(row);
        });

        // Dinleyicileri yalnızca bir kez ekleyin
        const profileButtons = this.querySelectorAll('button[data-username]');
        profileButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const username = button.getAttribute('data-username');
                window.route({target: { href: '/member?username=' + username }});
            });
        });
    }

    async fetchMatches() {
        const response = await fetch('https://45.157.16.17:8080/get_match_history', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            },
        });

        const matches = await response.json();
        const matchHistoryList = this.querySelector('#match-history-list');
        if (!matchHistoryList) return;

        matchHistoryList.innerHTML = '';

        matches.forEach(match => {
            const row = document.createElement('tr');
            const date = match.date ? new Date(match.date).toLocaleString('tr-TR') : '';
            row.innerHTML = `
                <td>${date}</td>
                <td><a href="#" data-username="${match.player1}">${match.player1}</a></td>
                <td><a href="#" data-username="${match.player2}">${match.player2}</a></td>
                <td>${match.score}</td>
                <td>${match.winner}</td>
            `;
            matchHistoryList.appendChild(row);
        });

        // Dinleyicileri yalnızca bir kez ekleyin
        const playerLinks = this.querySelectorAll('a[data-username]');
        playerLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const username = link.getAttribute('data-username');
                window.route({target: { href: '/member?username=' + username }});
            });
        });
    }

    async fetchPosts() {
        const response = await fetch('https://45.157.16.17:8080/get_post', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
				'Authorization': `Bearer ${localStorage.getItem('access')}`
            },
        });
        
        if (!response.ok) {
            return;
        }
    
        const posts = await response.json();
    
        const postsList = this.querySelector('#posts-list');
        postsList.innerHTML = '';
        posts.forEach(post => {
            const row = document.createElement('li');
            const date = post.date ? new Date(post.date).toLocaleString('tr-TR') : '';
            row.className = 'list-group-item';
            row.innerHTML = `
                <h5 class="card-title mb-2">${post.title}</h5>
                <p class="card-text mb-2">${post.message}</p>
                <p class="card-text mb-2"><b>Date:</b> ${date}</p>
                <p class="card-text mb-2"><b>Location:</b> ${post.location}</p>
                <p class="card-text mb-2"><b>Max People:</b> ${post.max_people}</p>
                <p class="card-text mb-2"><b>Applicants:</b> ${post.applicants.join(', ')}</p>
            `;
            if (post.max_people > post.applicants.length && post.applicants.indexOf(localStorage.getItem('username')) === -1) {
                row.innerHTML += `<button class="btn btn-primary" data-post-id="${post.id}">Apply</button>`;
            }
    
            const applyButton = row.querySelector('.btn-primary');
            if (applyButton) {
                applyButton.addEventListener('click', async (event) => {
                    const postId = applyButton.getAttribute('data-post-id');
                    await this.addApplicant(postId);
                });
            }
    
            postsList.appendChild(row);
        });
    }
    
    
    async addApplicant(postId) {
        const response = await fetch('https://45.157.16.17:8080/add_applicant', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
				'Authorization': `Bearer ${localStorage.getItem('access')}`
            },
            body: JSON.stringify({ post_id: postId })
        })
    
        if (!response.ok) {
            return;
        }
    
        await this.fetchPosts();
    }

    async postSubmit() {
        const title = this.querySelector('#post-title').value;
        const message = this.querySelector('#post-message').value;
        const date = this.querySelector('#post-date').value;
        const location = this.querySelector('#post-location').value;
        let maxPeople = this.querySelector('#post-max-people').value;

        if (!title || !message || !date || !location || !maxPeople) {
            return;
        }

        if (maxPeople < 1)
            maxPeople = 1;

        const formattedDate = new Date(date).toISOString();

        const response = await fetch('https://45.157.16.17:8080/create_post', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
				'Authorization': `Bearer ${localStorage.getItem('access')}`
            },
            body: JSON.stringify({
                title: title,
                message: message,
                date: formattedDate,
                location: location,
                max_people: maxPeople
            })
        });
        if (!response.ok) {
            return;
        }
        await this.fetchPosts();
        this.querySelector('#post-title').value = '';
        this.querySelector('#post-message').value = '';
        this.querySelector('#post-date').value = '';
        this.querySelector('#post-location').value = '';
        this.querySelector('#post-max-people').value = '';
    }
}

customElements.define('my-social-media', SocialMedia);
