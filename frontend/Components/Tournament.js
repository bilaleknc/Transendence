import Play from "../static/offline_pingpong.js";

class Tournament extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div id="tournament-container" class="container mt-5">
                <h1 class="text-center text-white mb-4">Tournament</h1>
                <div id="winner-announcement" class="text-center text-white mb-3"></div>
                <div id="player-list" class="mb-3">
                    <h3 class="text-white text-center">Enter Player Names</h3>
                </div>
                <button id="add-player" class="btn btn-dark w-100 mb-3">Add Player</button>
                <button id="start-tournament" class="btn btn-success w-100">Start Tournament</button>
            </div>
            <div id="match-info" class="text-center text-white mb-3"></div>
            <div id="game-area" class="d-none" style="max-width: 800px; margin: 0 auto;">
                <canvas id="game-canvas" width="800" height="400"></canvas>
            </div>
            <div id="waiting-match" style="font-size: smaller;"></div>
            <div id="tournament-rounds" class="mb-3 d-none col-8 mx-auto">
                    <h3 class="text-white">Tournament Rounds</h3>
                    <table class="table table-dark table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Match</th>
                                <th scope="col">Player 1</th>
                                <th scope="col">Player 2</th>
                                <th scope="col">Winner</th>
                            </tr>
                        </thead>
                        <tbody id="rounds-table-body">
                        </tbody>
                    </table>
                </div>
        `;
        this.players = [];
        this.currentRound = 0;

        this.querySelector('#add-player').addEventListener('click', () => this.addPlayerInput());
        this.querySelector('#start-tournament').addEventListener('click', () => this.startTournament());
    }

    addPlayerInput() {
        
        const playerList = this.querySelector('#player-list');
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-3');

        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('form-control', 'bg-dark', 'text-white');
        input.placeholder = 'Enter Player Name';
        input.setAttribute('aria-label', 'Player Name');
        input.setAttribute('aria-describedby', 'add-player');
        inputGroup.appendChild(input);

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('input-group-append');

        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => inputGroup.remove());
        buttonGroup.appendChild(removeButton);

        inputGroup.appendChild(buttonGroup);
        playerList.appendChild(inputGroup);
    }

    checkPlayerNames() {
        const playerInputs = this.querySelectorAll('#player-list input');
        const playerNames = [];
        playerInputs.forEach(input => {
            if (input.value.trim() !== '') {
                playerNames.push(input.value.trim());
            }
        });

        const uniquePlayerNames = new Set(playerNames);
        return playerNames.length === uniquePlayerNames.size;
    }

    startTournament() {
        if (!this.checkPlayerNames()) {
            this.displayMessage('Please enter unique player names.', 'danger');
            return;
        }
        const playerInputs = this.querySelectorAll('#player-list input');
        playerInputs.forEach(input => {
            if (input.value.trim() !== '') {
                this.players.push(input.value.trim());
            }
        });

        if (this.players.length < 2) {
            this.displayMessage('Please enter at least two players to start the tournament.', 'danger');
            return;
        }

        this.querySelector('#player-list').classList.add('d-none');
        this.querySelector('#tournament-rounds').classList.remove('d-none');
        this.querySelector('#add-player').classList.add('d-none');
        this.querySelector('#start-tournament').classList.add('d-none');

        this.createRounds();
        this.playRounds();
    }

    displayMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('alert', `alert-${type}`, 'text-center', 'mt-3');
        messageDiv.textContent = message;

        const tournamentContainer = this.querySelector('#tournament-container');
        tournamentContainer.insertBefore(messageDiv, tournamentContainer.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    createRounds() {
        const tournamentRounds = this.querySelector('#tournament-rounds');
        this.querySelector('#game-area').classList.remove('d-none');
    }

    initializeGameArea(player1, player2) {
        const gameArea = this.querySelector('#game-area');
        gameArea.innerHTML = `
            <canvas id="game-canvas" width="800" height="400"></canvas>
        `;
        const matchInfo = this.querySelector('#match-info');
        const nextMatchInfo = this.querySelector('#waiting-match');

        matchInfo.innerHTML = `
            <div class="card bg-white text-danger mx-auto" style="width: 50%;">
                <div class="text-center">
                    <h4>${player1} VS ${player2}</h4>
                </div>
            </div>
        `;

        nextMatchInfo.innerHTML = `<h4 class="text-center text-white f">Next Match: ${this.players[this.currentRound + 2] || ''}</h4>`;

        const play = new Play(player1, player2);
        return play;
    }

    async playRounds() {
        const rounds = this.players.length - 1;

        const playNextRound = async () => {
            if (this.currentRound < rounds) {
                const player1 = this.players[this.currentRound];
                const player2 = this.players[this.currentRound + 1];

                const play = this.initializeGameArea(player1, player2);
                const matchWinner = await play.loop();

                // Remove game canvas and VS text
                const gameArea = this.querySelector('#game-area');
                gameArea.innerHTML = '';

                this.displayMessage(`Match winner: ${matchWinner}`, 'success');

                this.players[this.currentRound + 1] = matchWinner;

                const roundsTableBody = this.querySelector('#rounds-table-body');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">${this.currentRound + 1}</th>
                    <td>${player1}</td>
                    <td>${player2}</td>
                    <td>${matchWinner}</td>
                `;
                roundsTableBody.appendChild(row);

                this.currentRound++;
                playNextRound();                
            } else {
                const tournamentWinner = this.players[this.players.length - 1];
                this.displayMessage(`Tournament winner: ${tournamentWinner}`, 'success');
                this.querySelector('#winner-announcement').innerHTML = `<h1 style="color: #28a745; font-size: 3rem; font-weight: bold;">${tournamentWinner}</h1>`;
            }
        };

        playNextRound();
    }
}

customElements.define('my-tournament', Tournament);
