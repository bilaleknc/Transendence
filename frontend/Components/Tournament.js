export class Tournament {
    constructor() {
        this.players = [];
        this.rounds = [];
        this.currentRound = 0;
    }

    addPlayer(playerName) {
        this.players.push(playerName);
    }

    start() {
        this.initializePlayers();
        this.createRounds();
        this.playRounds();
    }

    initializePlayers() {
        // For simplicity, adding dummy players
        this.addPlayer('Player 1');
        this.addPlayer('Player 2');
        this.addPlayer('Player 3');
        this.addPlayer('Player 4');
    }

    createRounds() {
        this.rounds = this.players.map((player, index) => {
            if (index % 2 === 0) {
                return { player1: player, player2: this.players[index + 1] };
            }
        }).filter(Boolean);
    }

    playRounds() {
        this.rounds.forEach((round, index) => {
            setTimeout(() => {
                const winner = this.playMatch(round.player1, round.player2);
                console.log(`Winner of round ${index + 1}: ${winner}`);
                this.players.push(winner);
                this.checkNextRound();
            }, index * 2000);
        });
    }

    playMatch(player1, player2) {
        // Simulate match result
        return Math.random() > 0.5 ? player1 : player2;
    }

    checkNextRound() {
        if (this.players.length === 1) {
            console.log(`Tournament winner: ${this.players[0]}`);
        } else {
            this.currentRound++;
            this.createRounds();
            this.playRounds();
        }
    }
}
