class Member extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="profile-page" class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="row">
          <!-- Profil Bilgileri -->
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <form id="profile-form" class="form">
                  <div class="text-center mb-3">
                    <img id="profile-image" src="https://via.placeholder.com/150" class="border" alt="Profile Image" width="200" height="auto">
                  </div>
                  <div class="mb-3">
                    <label for="profile-fullname" class="form-label">Tam Adı</label>
                    <input type="text" id="profile-fullname" name="fullname" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-username" class="form-label">Kullanıcı Adı</label>
                    <input type="text" id="profile-username" name="username" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-email" class="form-label">Email</label>
                    <input type="email" id="profile-email" name="email" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-instagram" class="form-label">Instagram Hesabı</label>
                    <input type="text" id="profile-instagram" name="instagram" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-linkedin" class="form-label">Linkedin Hesabı</label>
                    <input type="text" id="profile-linkedin" name="linkedin" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-registered" class="form-label">Kayıt Tarihi</label>
                    <input type="text" id="profile-registered" name="registered" class="form-control" readonly>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <!-- Maç Geçmişi ve İstatistikler -->
          <div class="col-md-6">
            <div class="row">
              <!-- Maç Geçmişi -->
              <div class="col-md-12">
                <div class="card mt-4 shadow-sm">
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
              </div>
              <!-- İstatistikler -->
              <div class="col-md-12 mt-4">
                <div class="card shadow-sm">
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
        </div>
      </div>
    </div>
  </div>
  
    `;
  }

  async fetchProfile() {
    try {
      // https://localhost:8082/member?username=muerdoga
      // urlden username alınacak
      const username = new URLSearchParams(window.location.search).get('username');
      console.log(`https://localhost:8080/member?username=${username}`);
      const response = await fetch(`https://localhost:8080/member?username=${username}`);
      const data = await response.json();
      console.log(data);
      this.populateProfile(data);
      this.populateMatchHistory(data.matchHistory);
      this.calculateStatistics(data.matchHistory);
  } catch (error) {
    console.error('Error:', error);
  }
}

  populateProfile(data) {
    const date = data.registered ? new Date(data.registered).toLocaleDateString('tr-TR') : '';

    this.querySelector('#profile-image').src = data.image ? data.image : 'https://via.placeholder.com/150';
    this.querySelector('#profile-fullname').value = data.fullname ? data.fullname : '';
    this.querySelector('#profile-username').value = data.username ? data.username : '';
    this.querySelector('#profile-email').value = data.email ? data.email : '';
    this.querySelector('#profile-registered').value = date ? date : '';
    this.querySelector('#profile-instagram').value = data.instagram ? data.instagram : '';
    this.querySelector('#profile-linkedin').value = data.linkedin ? data.linkedin : '';
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


  connectedCallback() {
    this.fetchProfile();
    this.querySelector('#profile-form').addEventListener('submit', (e) => this.updateProfile(e));
  }
}

customElements.define('my-member', Member);
