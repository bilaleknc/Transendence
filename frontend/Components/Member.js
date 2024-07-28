import error from "../ModulesJS/ErrorUtils.js";

class Member extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="error-content">
                <my-error name="" content=""><my-error>
    </div>
    <div class="container mt-4">
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <span id="profile-active" class="badge w-100 p-2">Active</span>
          <img id="profile-image" class="card-img-top" src="https://via.placeholder.com/150" alt="Profile Image">
          <div class="card-body">
            <h5 class="card-title" id="profile-fullname">Full Name</h5>
            <p class="card-text">
              <strong>Username:</strong> <span id="profile-username"></span><br>
              <strong>Email:</strong> <span id="profile-email"></span><br>
              <strong>Registered:</strong> <span id="profile-registered"></span><br>
              <strong>Instagram:</strong> <span id="profile-instagram"></span><br>
              <strong>LinkedIn:</strong> <span id="profile-linkedin"></span><br>
            </p>
            <button id="add-friend" class="btn btn-primary w-100">Add Friend</button>
            <button id="remove-friend" class="btn btn-danger w-100 d-none">Remove Friend</button>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title">Match History</h5>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Player 1</th>
                  <th>Player 2</th>
                  <th>Score</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody id="match-history">
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Statistics</h5>
          </div>
          <div class="card-body">
            <table class="table">
              <tbody id="statistics-list">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
    `;
  }

  connectedCallback() {
    this.fetchProfile();
    this.querySelector('#add-friend').addEventListener('click', () => this.addFriend());
    this.querySelector('#remove-friend').addEventListener('click', () => this.removeFriend());
    this.querySelector('#profile-form').addEventListener('submit', (e) => this.updateProfile(e));
  }

  async fetchProfile() {
    try {
      const username = new URLSearchParams(window.location.search).get('username');
      const response = await fetch(`https://45.157.16.17:8080/member?username=${username}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('access')}`,
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
					'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',

        }
      });
      if (response.status !== 200) {
        window.route({ target: { href: '/' } });
      }
      const data = await response.json();
      this.populateProfile(data);
      this.populateMatchHistory(data.matchHistory);
      this.calculateStatistics(data.matchHistory);
      this.checkFriendStatus(data.is_friend);
    } catch (error) {
      return;
    }
  }

  async addFriend() {
    try {
      const username = new URLSearchParams(window.location.search).get('username');
      const response = await fetch('https://45.157.16.17:8080/add_friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('access')}`,
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
					'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',

        },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.checkFriendStatus(true);
        error.call(this, {"success": "friend added"})
      } else {
        const errData = data.error || "An error occurred";
        error.call(this, {"error": errData})
      }
    } catch (error) {
      return;
    }
  }

  async removeFriend() {
    try {
      const username = new URLSearchParams(window.location.search).get('username');
      const response = await fetch('https://45.157.16.17:8080/remove_friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('access')}`,
		      'Authorization': `Bearer ${localStorage.getItem('access')}`,
					'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',


        },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.checkFriendStatus(false);
        error.call(this, {"success": "friend removed"})
      } else {
        const errData = data.error || "An error occurred";
        error.call(this, {"error": errData})
      }
    } catch (error) {
      return;
    }
  }

  checkFriendStatus(isFriend) {
    const addFriendBtn = this.querySelector('#add-friend');
    const removeFriendBtn = this.querySelector('#remove-friend');
    
    if (isFriend) {
      addFriendBtn.classList.add('d-none');
      removeFriendBtn.classList.remove('d-none');
    } else {
      addFriendBtn.classList.remove('d-none');
      removeFriendBtn.classList.add('d-none');
    }
  }

  populateProfile(data) {
    const date = data.registered ? new Date(data.registered).toLocaleDateString('en-US') : '';

    const activeBadge = this.querySelector('#profile-active');
    activeBadge.textContent = data.active ? 'Online' : 'Offline';
    activeBadge.className = data.active ? 'badge bg-success text-white w-100' : 'badge bg-danger text-white w-100';

    this.querySelector('#profile-image').src = data.image ? data.image : 'https://via.placeholder.com/150';
    this.querySelector('#profile-fullname').textContent = data.fullname ? data.fullname : '';
    this.querySelector('#profile-username').textContent = data.username ? data.username : '';
    this.querySelector('#profile-email').textContent = data.email ? data.email : '';
    this.querySelector('#profile-registered').textContent = date ? date : '';
    this.querySelector('#profile-instagram').textContent = data.instagram ? data.instagram : '';
    this.querySelector('#profile-linkedin').textContent = data.linkedin ? data.linkedin : '';
  }

  populateMatchHistory(matchHistory) {
    const matchHistoryElement = this.querySelector('#match-history');
    matchHistoryElement.innerHTML = matchHistory.map(match => `
      <tr>
        <td>${new Date(match.date).toLocaleDateString('en-US')}</td>
        <td>${match.player1}</td>
        <td>${match.player2}</td>
        <td>${match.score}</td>
        <td class="${match.winner === match.player1 ? 'text-success' : 'text-danger'}">${match.winner}</td>
      </tr>
    `).join('');
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
  }
  
}

customElements.define('my-member', Member);
