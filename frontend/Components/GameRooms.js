class GameRooms extends HTMLElement {
	// Constructor
	constructor() {
		super();
		this.innerHTML = `
		<div id="profile-page" class="container mt-5">
    	<div class="row justify-content-center">
      	<div class="col-lg-8">
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
          'Authorization': `Token ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // match history data example
      // match_history = [
      //   {"date": "2021-06-01", "opponent": "xyz", "score": "3-1"},
      //   {"date": "2021-06-02", "opponent": "abc", "score": "1-2"},
      // ];
      
      const myGameRooms = [
          { name: 'Room 1' },
          { name: 'Room 2' },
          { name: 'Room 3' },
          { name: 'Room 4' },
          { name: 'Room 5' }
      ];
      
      const data = await response.json();
    //   console.log(data);
      this.populateMatchHistory(data.matchHistory);
      this.calculateStatistics(data.matchHistory);
      this.populateFriends(data.allUsers, data.username);
      this.populateGameRooms(myGameRooms);
  } catch (error) {
    console.error('Error:', error);
  }
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

  connectedCallback() {
	this.fetchProfile();
  }
}

customElements.define('game-rooms', GameRooms);
	
	

	// 	const handleRoomClick = (roomId) => {
	// 		// Display "Waiting for other player" message
	// 		// ...
	
	// 		// Connect to the backend user container via WebSocket
	// 		// ...
	
	// 		// Start the game
	// 		// ...
	// 	};
	
	// 	// Render the component
	// 	return (
	// 		<div>
	// 			{/* Render the game rooms */}
	// 			{/* ... */}
	// 		</div>
	// 	);
	// };