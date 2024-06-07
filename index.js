function exitGame() {
    // Show a confirmation dialog
    const confirmation = confirm("Are you sure you want to exit the game?");
    if (confirmation) {
        // Redirect to a blank page
        window.location.href = "about:blank";
        // Attempt to close after a short delay (e.g., 1 second)
        setTimeout(() => {
            window.close();
        }, 1000);
    }
}

// Populate the saved games dropdown (dummy data for demonstration)
function populateSavedGames() {
    const savedGames = [
        { id: 1, name: 'Save 1' },
        { id: 2, name: 'Save 2' },
        { id: 3, name: 'Save 3' }
    ];
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
    populateSavedGames();
}

function hideLoadGameOverlay() {
    const overlay = document.getElementById('loadGameOverlay');
    overlay.classList.remove('show');
}

function populateSavedGames() {
    const savedGames = Object.keys(localStorage)
        .filter(key => key.startsWith('gameState_'))
        .map(key => ({
            id: key,
            name: key.replace('gameState_', '')
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

function loadSavedGame() {
    const select = document.getElementById('savedGameSelect');
    const selectedGameKey = select.value;
    const gameState = localStorage.getItem(selectedGameKey);
    if (gameState) {
        sessionStorage.setItem('loadedGameState', gameState);
        const { pageType } = JSON.parse(gameState);
        location.href = `${pageType}.html`;
    } else {
        alert('Failed to load the selected game.');
    }
    hideLoadGameOverlay();
}


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

// Populate the high scores table (dummy data for demonstration)
function populateHighScores() {
    const highScores = [
        { name: 'Player1', score: 10000 },
        { name: 'Player2', score: 8000 },
        { name: 'Player3', score: 6000 },
        { name: 'Player4', score: 4000 },
        { name: 'Player5', score: 2000 }
    ];
    const highScoresTableBody = document.querySelector('#highScoresTable tbody');
    highScoresTableBody.innerHTML = '';
    highScores.forEach(score => {
        const row = document.createElement('tr');
        const playerNameCell = document.createElement('td');
        const playerScoreCell = document.createElement('td');
        playerNameCell.textContent = score.name;
        playerScoreCell.textContent = score.score;
        row.appendChild(playerNameCell);
        row.appendChild(playerScoreCell);
        highScoresTableBody.appendChild(row);
    });
}
