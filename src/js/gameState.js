const GameState = {
    score: 0,
    isShown: false,
    isRunning: false,
    isWin: false,
    addScore(amount = 1) {
        this.score += amount;
    },
    resetStates() {
        this.score = 0;
        this.isRunning = false;
    },
}

export default GameState;