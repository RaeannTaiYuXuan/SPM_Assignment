// Function to prevent back navigation
function preventBackNavigation() {
    // Push a new state to the history stack
    history.pushState(null, null, location.href);
    // Listen for popstate event
    window.addEventListener('popstate', function(event) {
        // Push a new state to prevent back navigation
        history.pushState(null, null, location.href);
    });
}

preventBackNavigation(); // Call the function to prevent back navigation

// Handle beforeunload event to prevent closing the tab or navigating away
window.addEventListener('beforeunload', function (e) {
    // Cancel the event as stated by the standard
    e.preventDefault();
    // Chrome requires returnValue to be set
    e.returnValue = '';
});

document.querySelectorAll('.menuButton').forEach(button => {
    button.addEventListener('click', function () {
        if (this.textContent.trim() === 'Start Free Play Game') {
            sessionStorage.removeItem('loadedGameState'); // Clear any previously loaded game state
        }
    });
});

// Show the high scores overlay
function showHighScoresOverlay() {
    const overlay = document.getElementById('highScoresOverlay');
    overlay.classList.add('show');
    populateHighScores();
}

// Hide the high scores overlay
function hideHighScoresOverlay() {
    const overlay = document.getElementById('highScoresOverlay');
    overlay.classList.remove('show');
}

// Populate the high scores table from local storage
function populateHighScores() {
    const arcadeHighScores = JSON.parse(localStorage.getItem('arcadeHighScores')) || [];
    const freePlayHighScores = JSON.parse(localStorage.getItem('freePlayHighScores')) || [];
    const arcadeHighScoresTableBody = document.querySelector('#arcadeHighScoresTable tbody');
    const freePlayHighScoresTableBody = document.querySelector('#freePlayHighScoresTable tbody');
    
    arcadeHighScoresTableBody.innerHTML = '';
    freePlayHighScoresTableBody.innerHTML = '';

    // Populate Arcade High Scores
    for (let i = 0; i < 10; i++) {
        const row = document.createElement('tr');
        const playerNameCell = document.createElement('td');
        const playerScoreCell = document.createElement('td');

        if (arcadeHighScores[i]) {
            playerNameCell.textContent = arcadeHighScores[i].name;
            playerScoreCell.textContent = arcadeHighScores[i].score;
        } else {
            playerNameCell.textContent = '-';
            playerScoreCell.textContent = '-';
        }

        row.appendChild(playerNameCell);
        row.appendChild(playerScoreCell);
        arcadeHighScoresTableBody.appendChild(row);
    }

    // Populate Free Play High Scores
    for (let i = 0; i < 10; i++) {
        const row = document.createElement('tr');
        const playerNameCell = document.createElement('td');
        const playerScoreCell = document.createElement('td');

        if (freePlayHighScores[i]) {
            playerNameCell.textContent = freePlayHighScores[i].name;
            playerScoreCell.textContent = freePlayHighScores[i].score;
        } else {
            playerNameCell.textContent = '-';
            playerScoreCell.textContent = '-';
        }

        row.appendChild(playerNameCell);
        row.appendChild(playerScoreCell);
        freePlayHighScoresTableBody.appendChild(row);
    }
}

// Populate the saved games dropdown
function populateSavedGames() {
    const savedGames = Object.keys(localStorage)
        .filter(key => key.startsWith('arcadeGameState_') || key.startsWith('gameState_'))
        .map(key => ({
            id: key,
            name: key.replace('arcadeGameState_', '').replace('gameState_', '')
        }));
    const select = document.getElementById('savedGameSelect');
    select.innerHTML = '';
    savedGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.name;
        select.appendChild(option);
    });
}

function showLoadGameOverlay() {
    const overlay = document.getElementById('loadGameOverlay');
    overlay.classList.add('show');
    populateSavedGames();  // Call this function to populate saved games
}

function hideLoadGameOverlay() {
    const overlay = document.getElementById('loadGameOverlay');
    overlay.classList.remove('show');
}

function loadSavedGame() {
    const select = document.getElementById('savedGameSelect');
    const selectedGameKey = select.value;
    const gameState = localStorage.getItem(selectedGameKey);
    if (gameState) {
        sessionStorage.setItem('loadedGameState', gameState);
        const { pageType } = JSON.parse(gameState);
        if (pageType === 'ArcadeGame') {
            location.href = 'ArcadeGame.html';
        } else {
            location.href = 'FreePlay.html';
        }
    } else {
        alert('Failed to load the selected game.');
    }
    hideLoadGameOverlay();
}

// Event listeners for showing and hiding the load game overlay
document.getElementById('loadGameButton').addEventListener('click', showLoadGameOverlay);
document.getElementById('closeLoadGameOverlay').addEventListener('click', hideLoadGameOverlay);
document.getElementById('loadGameConfirmButton').addEventListener('click', loadSavedGame);
