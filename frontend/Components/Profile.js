class Profile extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div id="profile-page" class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <h2 class="mb-4 text-center">Profil</h2>
            <div class="card">
              <div class="card-body">
                <form id="profile-form" class="form">
                  <div class="text-center mb-3">
                    <img id="profile-image" src="https://via.placeholder.com/150" class="width="150" height="150">
                  </div>
                  <div class="mb-3">
                    <label for="profile-fullname" class="form-label">Tam Adı</label>
                    <input type="text" id="profile-fullname" name="fullname" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label for="profile-username" class="form-label">Kullanıcı Adı</label>
                    <input type="text" id="profile-username" name="username" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label for="profile-email" class="form-label">Email</label>
                    <input type="email" id="profile-email" name="email" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label for="profile-password" class="form-label">Yeni Şifre</label>
                    <input type="password" id="profile-password" name="password" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label for="profile-registered" class="form-label">Kayıt Tarihi</label>
                    <input type="text" id="profile-registered" name="registered" class="form-control" readonly>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Güncelle</button>
                </form>
              </div>
            </div>
            <div class="card mt-4">
              <div class="card-body">
                <h5 class="card-title">Maç Geçmişi</h5>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Tarih</th>
                      <th scope="col">Rakip</th>
                      <th scope="col">Skor</th>
                    </tr>
                  </thead>
                  <tbody id="match-history">
                    <!-- Maç geçmişi burada görünecek -->
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card mt-4">
              <div class="card-body">
                <h5 class="card-title">İstatistikler</h5>
                <table class="table table-striped">
                  <tbody id="statistics-list">
                    <!-- İstatistikler burada görünecek -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async fetchProfile() {
    const data = {
      image: 'https://cdn.intra.42.fr/users/53ddddb821c330abf341a0a3ccb5fc6f/muerdoga.jpg',
      fullname: 'Mustafa Eren Erdoğan',
      username: 'muerdoga',
      email: 'erenerdoga037@gmail.com',
      registered: '2021-01-01',
      matchHistory: [
        { date: '2021-01-01', opponent: 'Jane Doe', score: '2-0' },
        { date: '2021-01-02', opponent: 'Jane Doe', score: '2-1' },
        { date: '2021-01-03', opponent: 'Jane Doe', score: '1-2' }
      ]
    };

    this.querySelector('#profile-image').src = data.image;
    this.querySelector('#profile-fullname').value = data.fullname;
    this.querySelector('#profile-username').value = data.username;
    this.querySelector('#profile-email').value = data.email;
    this.querySelector('#profile-registered').value = data.registered;

    this.populateMatchHistory(data.matchHistory);
    this.calculateStatistics(data.matchHistory);
  }

  populateMatchHistory(matchHistory) {
    const matchHistoryElement = this.querySelector('#match-history');
    matchHistory.forEach(match => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${match.date}</td>
        <td>${match.opponent}</td>
        <td>${match.score}</td>
      `;
      matchHistoryElement.appendChild(row);
    });
  }

  calculateStatistics(matchHistory) {
    const totalMatches = matchHistory.length;
    let totalWins = 0;
    let totalLosses = 0;
    let totalScored = 0;
    let totalConceded = 0;

    matchHistory.forEach(match => {
      const [myScore, opponentScore] = match.score.split('-').map(Number);
      if (myScore > opponentScore) {
        totalWins++;
      } else if (myScore < opponentScore) {
        totalLosses++;
      }
      totalScored += myScore;
      totalConceded += opponentScore;
    });

    const statisticsList = this.querySelector('#statistics-list');
    statisticsList.innerHTML = `
      <tr>
        <td>Toplam Maç</td>
        <td>${totalMatches}</td>
      </tr>
      <tr>
        <td>Galibiyet</td>
        <td>${totalWins}</td>
      </tr>
      <tr>
        <td>Mağlubiyet</td>
        <td>${totalLosses}</td>
      </tr>
      <tr>
        <td>Atılan Gol</td>
        <td>${totalScored}</td>
      </tr>
      <tr>
        <td>Yenilen Gol</td>
        <td>${totalConceded}</td>
      </tr>
    `;
  }

  async updateProfile(e) {
    e.preventDefault();
    const fullname = this.querySelector('#profile-fullname').value;
    const username = this.querySelector('#profile-username').value;
    const email = this.querySelector('#profile-email').value;
    const password = this.querySelector('#profile-password').value;

    try {
      const response = await fetch('https://localhost:8080/profile', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          fullname: fullname,
          username: username,
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const resData = await response.json();
      if (resData.error) {
        alert(resData.error);
      } else {
        alert('Profil güncellendi');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  connectedCallback() {
    this.fetchProfile();
    this.querySelector('#profile-form').addEventListener('submit', (e) => this.updateProfile(e));
  }
}

customElements.define('my-profile', Profile);
