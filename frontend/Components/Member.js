class Member extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="profile-page" class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-12">
        <div class="row">
          <!-- Profile Information -->
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <form id="profile-form" class="form">
                  <div class="text-center mb-3">
                    <img id="profile-image" src="https://via.placeholder.com/150" style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%;">
                  </div>
                  <div class="mb-3">
                    <label for="profile-fullname" class="form-label">Full Name</label>
                    <input type="text" id="profile-fullname" name="fullname" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-username" class="form-label">Username</label>
                    <input type="text" id="profile-username" name="username" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-email" class="form-label">Email</label>
                    <input type="email" id="profile-email" name="email" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-instagram" class="form-label">Instagram Account</label>
                    <input type="text" id="profile-instagram" name="instagram" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-linkedin" class="form-label">Linkedin Account</label>
                    <input type="text" id="profile-linkedin" name="linkedin" class="form-control" readonly>
                  </div>
                  <div class="mb-3">
                    <label for="profile-registered" class="form-label">Registration Date</label>
                    <input type="text" id="profile-registered" name="registered" class="form-control" readonly>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <!-- Activity Status, Add Friend, Match History, and Statistics -->
          <div class="col-md-6">
            <div class="row">
              <!-- Activity Status -->
              <div class="col-md-12">
                <div class="card shadow-sm mb-4">
                  <div class="card-body text-center">
                    <span id="profile-active" class="badge"></span>
                  </div>
                </div>
              </div>
              <!-- Add Friend -->
              <div class="col-md-12">
                <div id="add-friend-container" class="card shadow-sm">
                  <div class="card-body">
                    <button id="add-friend" class="btn bg-dark text-white w-100">Add Friend</button>
                    <button id="remove-friend" class="btn bg-danger text-white w-100 d-none">Remove Friend</button>
                  </div>
                </div>
              </div>
              <!-- Match History and Statistics -->
              <div class="col-md-12 mt-4">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">Match History</h5>
                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
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
                        <tbody id="match-history">
                          <!-- Match history will be populated here -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-12 mt-4">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">Statistics</h5>
                    <table class="table table-striped">
                      <tbody id="statistics-list">
                        <!-- Statistics will be displayed here -->
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

  async connectedCallback() {
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
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        }
      });
      if (response.status !== 200) {
        alert('User not found');
        window.location.href = '/';
      }
      const data = await response.json();
      this.populateProfile(data);
      this.populateMatchHistory(data.matchHistory);
      this.calculateStatistics(data.matchHistory);
      this.checkFriendStatus(data.is_friend);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async addFriend() {
    try {
      const username = new URLSearchParams(window.location.search).get('username');
      const response = await fetch('https://45.157.16.17:8080/add_friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.checkFriendStatus(true);
        alert("Friend added");
      } else {
        alert(data.error || "An error occurred");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async removeFriend() {
    try {
      const username = new URLSearchParams(window.location.search).get('username');
      const response = await fetch('https://45.157.16.17:8080/remove_friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (response.status === 200) {
        this.checkFriendStatus(false);
        alert("Friend removed");
      } else {
        alert(data.error || "An error occurred");
      }
    } catch (error) {
      console.error('Error:', error);
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
      const date = new Date(match.date).toLocaleString('tr-TR');
      row.innerHTML = `
        <td>${date}</td>
        <td>${match.player1}</td>
        <td>${match.player2}</td>
        <td>${match.score}</td>
        <td class="${match.winner === match.player1 ? 'text-success' : 'text-danger'}">${match.winner}</td>
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
        <td>Total Matches</td>
        <td>${totalMatches}</td>
      </tr      <tr>
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
        'Authorization': `Token ${localStorage.getItem('access_token')}`
      }
    });
    if (response.status !== 200) {
      alert('User not found');
      window.location.href = '/';
    }
    const data = await response.json();
    this.populateProfile(data);
    this.populateMatchHistory(data.matchHistory);
    this.calculateStatistics(data.matchHistory);
    this.checkFriendStatus(data.is_friend);
  } catch (error) {
    console.error('Error:', error);
  }
}

async addFriend() {
  try {
    const username = new URLSearchParams(window.location.search).get('username');
    const response = await fetch('https://45.157.16.17:8080/add_friend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ username })
    });
    const data = await response.json();
    if (response.status === 200) {
      this.checkFriendStatus(true);
      alert("Friend added");
    } else {
      alert(data.error || "An error occurred");
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async removeFriend() {
  try {
    const username = new URLSearchParams(window.location.search).get('username');
    const response = await fetch('https://45.157.16.17:8080/remove_friend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ username })
    });
    const data = await response.json();
    if (response.status === 200) {
      this.checkFriendStatus(false);
      alert("Friend removed");
    } else {
      alert(data.error || "An error occurred");
    }
  } catch (error) {
    console.error('Error:', error);
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
  this.querySelector('#profile-fullname').value = data.fullname ? data.fullname : '';
  this.querySelector('#profile-username').value = data.username ? data.username : '';
  this.querySelector('#profile-email').value = data.email ? data.email : '';
  this.querySelector('#profile-registered').value = date ? date : '';
  this.querySelector('#profile-instagram').value = data.instagram ? data.instagram : '';
  this.querySelector('#profile-linkedin').value = data.linkedin ? data.linkedin : '';
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

