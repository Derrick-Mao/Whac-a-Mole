class GameModel {
  constructor() {
    this.holes = [];
    this.score = 0;
    this.timer = 30;
    this.isGameActive = false;
    this.maxMoles = 3;
    this.activeMoleCount = 0;
  }

  // init new gameboard state
  initHoles() {
    this.holes = [];
    for (let i = 0; i < 12; ++i) {
      this.holes.push({
        id: i,
        hasMole: false,
      });
    }

    this.activeMoleCount = 0;
  }

  // get a random hole index that doesn't have a mole
  getRandomEmptyHole() {
    const emptyHoles = this.holes
      .map((hole, index) => ({ hole, index }))
      .filter(item => !item.hole.hasMole);
    
    if (emptyHoles.length === 0) return -1;
    
    const randomIndex = Math.floor(Math.random() * emptyHoles.length);
    return emptyHoles[randomIndex].index;
  }

  // add a mole to a specific hole
  addMole(holeId) {
    if (holeId >= 0 && holeId < this.holes.length && !this.holes[holeId].hasMole) {
      this.holes[holeId].hasMole = true;
      this.activeMoleCount++;
      return true;
    }
    return false;
  }

  // remove a mole from a specific hole
  removeMole(holeId) {
    if (holeId >= 0 && holeId < this.holes.length && this.holes[holeId].hasMole) {
      this.holes[holeId].hasMole = false;
      this.activeMoleCount--;
      return true;
    }
    return false;
  }

  incrementScore() {
    this.score++;
  }

  resetScore() {
    this.score = 0;
  }

  decrementTimer() {
    if (this.timer > 0) this.timer--;

    return this.timer;
  }

  resetTimer() {
    this.timer = 30;
  }

  isGameOver() {
    return this.timer <= 0;
  }

  setGameActive(active) {
    this.isGameActive = active;
  }

  getActiveMoleCount() {
    return this.activeMoleCount;
  }

  canAddMole() {
    return this.activeMoleCount < this.maxMoles;
  }
}

class GameView {
  constructor() {
    this.gbGrid = document.querySelector("#gameboard-grid");
    this.scoreDisplay = document.querySelector("#score-display");
    this.timerDisplay = document.querySelector("#countdown");
    this.startButton = document.querySelector("#start-btn");
    this.moleImagePath = 'mole.jpg';
  }

  renderBoard(holes) {
    this.gbGrid.innerHTML = "";

    holes.forEach(hole => {
      const holeElement = document.createElement("div");
      holeElement.className = "hole";
      holeElement.dataset.id = hole.id;
    
      if (hole.hasMole) {
        holeElement.classList.add('has-mole');
        const img = document.createElement('img');
        img.src = this.moleImagePath;
        img.alt = 'mole';
        holeElement.appendChild(img);
      }

      this.gbGrid.appendChild(holeElement);
    });
  }

  updateHole(holeId, hasMole) {
    const holeElement = document.querySelector(`.hole[data-id="${holeId}"]`);
    if (!holeElement) return;
    
    if (hasMole) {
      if (!holeElement.classList.contains('has-mole')) {
        holeElement.classList.add('has-mole');
        const img = document.createElement('img');
        img.src = this.moleImagePath;
        img.alt = 'mole';
        holeElement.appendChild(img);
      }
    } else {
      holeElement.classList.remove('has-mole');
      holeElement.innerHTML = ''; // Remove the image
    }
  }

  updateScore(score) {
    this.scoreDisplay.textContent = `Let's Go, your total score is ${score}`;
  }

  updateTimer(timer) {
    this.timerDisplay.textContent = timer;
  }

  resetBoard() {
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => {
      hole.classList.remove('has-mole');
      hole.innerHTML = '';
    });
  }

  bindStartClick(eventHandler) {
    this.startButton.addEventListener('click', eventHandler);
  }

  bindHoleClick(eventHandler) {
    this.gbGrid.addEventListener('click', (event) => {
      const hole = event.target.closest('.hole');
      if (!hole) return;
      
      const holeId = parseInt(hole.dataset.id);
      eventHandler(holeId);
    });
  }

  alertGameOver() {
    alert("Time is up !!!");
  }
}

class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.moleInterval = null;
    this.timerInterval = null;

    this.init();
  }

  init() {
    this.model.initHoles();
    this.view.renderBoard(this.model.holes);

    this.view.bindStartClick(this.handleStartClick.bind(this));
    this.view.bindHoleClick(this.handleHoleClick.bind(this));

    this.view.updateScore(this.model.score);
    this.view.updateTimer(this.model.timer);
  }

  handleHoleClick(holeId) {
    console.log('Hole clicked:', holeId, 'Game active:', this.model.isGameActive); // Debug log

    if (!this.model.isGameActive) return;
    
    // Check if hole has a mole
    if (this.model.holes[holeId] && this.model.holes[holeId].hasMole) {
      this.model.removeMole(holeId);
      this.view.updateHole(holeId, false);
      
      this.model.incrementScore();
      this.view.updateScore(this.model.score);
    }
  }

  handleStartClick() {
    this.stopGame();

    this.model.resetScore();
    this.model.resetTimer();
    this.model.initHoles();
    this.model.setGameActive(true);

    this.view.updateScore(this.model.score);
    this.view.updateTimer(this.model.timer);
    this.view.resetBoard();

    this.startGame();
  }

  startGame() {
    this.clearIntervals();

    this.moleInterval = setInterval(() => {
      this.generateMole();
    }, 1000);

    this.moleInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  generateMole() {
    if (!this.model.isGameActive || !this.model.canAddMole()) return;
    
    const emptyholeId = this.model.getRandomEmptyHole();
    
    if (emptyholeId !== -1) {
      this.model.addMole(emptyholeId);
      this.view.updateHole(emptyholeId, true);
    }
  }

  updateTimer() {
    const timeLeft = this.model.decrementTimer();
    this.view.updateTimer(timeLeft);

    if (this.model.isGameOver()) {
      this.endGame();
    }
  }

  endGame() {
    this.model.setGameActive(false);

    this.clearIntervals();

    this.view.alertGameOver();
  }

  stopGame() {
    this.model.setGameActive(false);
    this.clearIntervals();
  }

  clearIntervals() {
    clearInterval(this.moleInterval);
    this.moleInterval = null;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
}

const model = new GameModel();
const view = new GameView();
const controller = new GameController(model, view);
