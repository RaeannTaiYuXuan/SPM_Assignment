// Show the load game overlay
function showLoadGameOverlay() {
    const overlay = document.getElementById('loadGameOverlay');
    overlay.classList.add('show');
    populateSavedGames();
}

// Hide the load game overlay
function hideLoadGameOverlay() {
    const overlay = document.getElementById('loadGameOverlay');
    overlay.classList.remove('show');
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

// Load the selected saved game
function loadSavedGame() {
    const select = document.getElementById('savedGameSelect');
    const selectedGameId = select.value;
    // Here you would load the game state based on the selectedGameId
    console.log(`Loading game with ID: ${selectedGameId}`);
    hideLoadGameOverlay();
}
