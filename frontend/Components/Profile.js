import error from "../ModulesJS/ErrorUtils.js";

class Profile extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="error-content">
        <my-error name="" content=""><my-error>
    </div>
    <div class="container mt-5">
    <div class="row">
      <div class="col-md-8">
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Match History</h3>
          </div>
          <div class="card-body">
            <table class="table table-striped" id="match-history">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Player 1</th>
                  <th>Player 2</th>
                  <th>Score</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Statistics</h3>
          </div>
          <div class="card-body">
            <table class="table table-bordered" id="statistics-list"></table>
          </div>
        </div>
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Graphs</h3>
          </div>
          <div class="card-body">
            <canvas id="myChart" width="400" height="400"></canvas>
          </div>
        </div>
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Friends</h3>
          </div>
          <div class="card-body">
            <table class="table table-hover" id="friends-list"></table>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Profile</h3>
          </div>
          <div class="card-body">
            <form id="profile-form">
              <div class="mb-3 text-center">
                <img id="profile-image" src="https://via.placeholder.com/150" class="img-fluid rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">
              </div>
              <div class="mb-3">
                <label for="profile-fullname" class="form-label">Full Name</label>
                <input type="text" id="profile-fullname" class="form-control">
              </div>
              <div class="mb-3">
                <label for="profile-username" class="form-label">Username</label>
                <input type="text" id="profile-username" class="form-control" disabled autocomplete="username">
              </div>
              <div class="mb-3">
                <label for="profile-email" class="form-label">Email</label>
                <input type="email" id="profile-email" class="form-control">
              </div>
              <div class="mb-3">
                <label for="profile-registered" class="form-label">Registered Date</label>
                <input type="text" id="profile-registered" class="form-control" disabled>
              </div>
              <div class="mb-3">
                <label for="profile-instagram" class="form-label">Instagram</label>
                <input type="text" id="profile-instagram" class="form-control">
              </div>
              <div class="mb-3">
                <label for="profile-linkedin" class="form-label">LinkedIn</label>
                <input type="text" id="profile-linkedin" class="form-control">
              </div>
              <div class="mb-3">
                <label for="profile-password" class="form-label">Password</label>
                <input type="password" id="profile-password" class="form-control" autocomplete="new-password">
              </div>
              <div class="mb-3">
                <label for="profile-image-url" class="form-label">Profile Image URL</label>
                <input type="text" id="profile-image-url" class="form-control">
              </div>
              <button type="submit" class="btn btn-primary w-100">Update Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
    `;
  }

  async fetchProfile() {
    try {
      const response = await fetch('https://45.157.16.17:8080/profile', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
        //   'Authorization': `Token ${localStorage.getItem('access_token')}`,
		      'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      this.populateProfile(data);
      this.populateMatchHistory(data.matchHistory, data.username);
      this.calculateStatistics(data.matchHistory, data.username);
      this.populateFriends(data.friends);
    } catch (error) {
      return;
    }
  }

  populateProfile(data) {
    const date = data.registered ? new Date(data.registered).toLocaleDateString('en-US') : '';

    this.querySelector('#profile-image-url').value = data.image ? data.image : '';
    this.querySelector('#profile-image').src = data.image ? data.image : 'https://via.placeholder.com/150';
    this.querySelector('#profile-fullname').value = data.fullname ? data.fullname : '';
    this.querySelector('#profile-username').value = data.username ? data.username : '';
    this.querySelector('#profile-email').value = data.email ? data.email : '';
    this.querySelector('#profile-registered').value = date ? date : '';
    this.querySelector('#profile-instagram').value = data.instagram ? data.instagram : '';
    this.querySelector('#profile-linkedin').value = data.linkedin ? data.linkedin : '';
  }

  populateMatchHistory(matchHistory, username) {
    const matchHistoryElement = this.querySelector('#match-history');
    matchHistory.forEach(match => {
      const row = document.createElement('tr');
      const date = new Date(match.date).toLocaleString('tr-TR');
      const isWinner = match.winner === username;
      row.innerHTML = `
        <td>${date}</td>
        <td>${match.player1}</td>
        <td>${match.player2}</td>
        <td>${match.score}</td>
        <td ${isWinner ? 'class="text-success"' : 'class="text-danger"'}>${match.winner}</td>
      `;
      matchHistoryElement.appendChild(row);
    });
  }

  calculateStatistics(matchHistory, username) {
    const totalMatches = matchHistory.length;
    let totalWins = 0;
    let totalLosses = 0;
    let totalScored = 0;
    let totalConceded = 0;
  
    matchHistory.forEach(match => {
      if (match.player1 === username) {
        totalScored += parseInt(match.score.split('-')[0]);
        totalConceded += parseInt(match.score.split('-')[1]);
        if (match.winner === username) {
          totalWins++;
        } else {
          totalLosses++;
        }
      } else if (match.player2 === username) {
        totalScored += parseInt(match.score.split('-')[1]);
        totalConceded += parseInt(match.score.split('-')[0]);
        if (match.winner === username) {
          totalWins++;
        } else {
          totalLosses++;
        }
      }
    });
  
    const statisticsList = this.querySelector('#statistics-list');
    statisticsList.innerHTML = `
      <tr>
        <td>Total Matches</td>
        <td>${totalMatches}</td>
      </tr>
      <tr>
        <td>Wins</td>
        <td>${totalWins}</td>
      </tr>
      <tr>
        <td>Losses</td>
        <td>${totalLosses}</td>
      </tr>
      <tr>
        <td>Goals Scored</td>
        <td>${totalScored}</td>
      </tr>
      <tr>
        <td>Goals Conceded</td>
        <td>${totalConceded}</td>
      </tr>
    `;
  
    const ctx = this.querySelector('#myChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Wins', 'Losses', 'Goals Scored', 'Goals Conceded'],
        datasets: [{
          label: 'Statistics',
          data: [totalWins, totalLosses, totalScored, totalConceded],
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }  

  populateFriends(friends) {
    const friendsList = this.querySelector('#friends-list');
    friends.forEach(friend => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${friend.image}" alt="${friend.username}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;"></td>
        <td>${friend.username}</td>
        <td><a href="/member?username=${friend.username}" class="btn bg-dark text-white">Profile</a></td>
      `;
      if (friend.active) {
        row.innerHTML += `<td><span class="badge bg-success text-white">Online</span></td>`;
      }
      else {
        row.innerHTML += `<td><span class="badge bg-danger text-white">Offline</span></td>`;
      }
      friendsList.appendChild(row);
    });
  }

  async updateProfile(e) {
    e.preventDefault();
    const image = this.querySelector('#profile-image-url').value;
    const fullname = this.querySelector('#profile-fullname').value;
    const username = this.querySelector('#profile-username').value;
    const email = this.querySelector('#profile-email').value;
    const password = this.querySelector('#profile-password').value;
    const instagram = this.querySelector('#profile-instagram').value;
    const linkedin = this.querySelector('#profile-linkedin').value;
    let first_name = '';
    let last_name = '';

    try {
      for (let i = 0; i < fullname.split(' ').length - 1; i++) {
        first_name += fullname.split(' ')[i] + ' ';
      }
      last_name = fullname.split(' ')[fullname.split(' ').length - 1];
      
      const response = await fetch('https://45.157.16.17:8080/update_profile', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
          'Authorization': `Token ${localStorage.getItem('access_token')}`,
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify({
          first_name: first_name.trim(),
          last_name: last_name,
          username: username,
          email: email,
          instagram: instagram,
          linkedin: linkedin,
          ...(password && { password: password }),
          ...(image && { image: image })
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const resData = await response.json();
      if (resData.error) {
        error.call(this, {"error": resData.error})
      } else {
        error.call(this, {"success": 'Profile updated successfully'})
      }
    } catch (error) {
      return;
    }
  }

  connectedCallback() {
    this.fetchProfile();
    this.querySelector('#profile-form').addEventListener('submit', (e) => this.updateProfile(e));
  }
}

customElements.define('my-profile', Profile);
