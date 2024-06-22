class Profile extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="profile-page" class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="row">
          <!-- Sol Sütun: Profil Bilgileri ve Arkadaşlar -->
          <div class="col-md-6">
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h5 class="card-title mb-4">Profil</h5>
                <form id="profile-form" class="form">
                  <div class="text-center mb-3">
                    <img id="profile-image" src="https://via.placeholder.com/150" class="border" alt="Profile Image" width="200" height="auto">
                  </div>
                  <div class="mb-3">
                    <label for="profile-fullname" class="form-label">Tam Adı</label>
                    <input type="text" id="profile-fullname" name="fullname" class="form-control">
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
                    <input type="text" id="profile-instagram" name="instagram" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label for="profile-linkedin" class="form-label">Linkedin Hesabı</label>
                    <input type="text" id="profile-linkedin" name="linkedin" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label for="profile-registered" class="form-label">Kayıt Tarihi</label>
                    <input type="text" id="profile-registered" name="registered" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-password" class="form-label">Şifre</label>
                    <input type="password" id="profile-password" name="password" class="form-control">
                  </div>
                  <button type="submit" class="btn bg-dark text-white w-100">Güncelle</button>
                </form>
              </div>
            </div>
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-4">Arkadaşlar</h5>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Kullanıcı Adı</th>
                      <th scope="col">Profil</th>
                    </tr>
                  </thead>
                  <tbody id="friends-list">
                    <!-- Arkadaşlar burada görünecek -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Sağ Sütun: Maç Geçmişi, İstatistikler ve Oyun Odaları -->
          <div class="col-md-6">
            <div class="card mt-4 shadow-sm mb-4">
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
            <div class="card mt-4 shadow-sm mb-4">
              <div class="card-body">
                <h5 class="card-title">İstatistikler</h5>
                <table class="table table-striped">
                  <tbody id="statistics-list">
                    <!-- İstatistikler burada görünecek -->
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card mt-4 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Oyun Odaları</h5>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Oda Adı</th>
                      <th scope="col">Katıl</th>
                    </tr>
                  </thead>
                  <tbody id="game-rooms">
                    <!-- Oyun Odaları burada görünecek -->
                  </tbody>
                </table>
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
      const response = await fetch('https://localhost:8080/profile', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const myGameRooms = [
          { name: 'Room 1' },
          { name: 'Room 2' },
          { name: 'Room 3' },
          { name: 'Room 4' },
          { name: 'Room 5' }
      ];
      
      const data = await response.json();
      console.log(data);
      this.populateProfile(data);
      this.populateMatchHistory(data.matchHistory);
      this.calculateStatistics(data.matchHistory);
      this.populateFriends(data.allUsers, data.username);
      this.populateGameRooms(myGameRooms);
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
  
  populateFriends(friends, username) {
    const friendsList = this.querySelector('#friends-list');
    friends.forEach(friend => {
      if (friend === username) {
        return;
      }
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${friend}</td>
        <td><a href="/member?username=${friend}" class="btn bg-dark text-white">Profil</a></td>
      `;
      friendsList.appendChild(row);
    });
  }

  populateGameRooms(gameRooms) {
    const gameRoomsList = this.querySelector('#game-rooms');
    gameRooms.forEach(room => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.name}</td>
        <td><a href="/game-room?name=${room.name}" class="btn bg-dark text-white">Katıl</a></td>
      `;
      gameRoomsList.appendChild(row);
    });
  }

  async updateProfile(e) {
    e.preventDefault();
    const fullname = this.querySelector('#profile-fullname').value;
    const username = this.querySelector('#profile-username').value;
    const email = this.querySelector('#profile-email').value;
    const password = this.querySelector('#profile-password').value;
    const instagram = this.querySelector('#profile-instagram').value;
    const linkedin = this.querySelector('#profile-linkedin').value;

    try {
      let first_name = '';
      let last_name = '';
      for (let i = 0; i < fullname.split(' ').length; i++) {
        if(i === fullname.split(' ').length - 1)
          first_name += fullname.split(' ')[i] + ' ';
        else
          last_name += fullname.split(' ')[i] + ' ';
      }

      const response = await fetch('https://localhost:8080/update_profile', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          first_name: fullname.split(' ')[0],
          username: username,
          email: email,
          instagram: instagram,
          linkedin: linkedin,
          ...(password && { password: password })
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
