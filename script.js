document.addEventListener('DOMContentLoaded', () => {
    const cityGrid = document.getElementById('cityGrid');
    const resetButton = document.getElementById('resetButton');
    const saveButton = document.getElementById('saveButton');
    const demolishButton = document.getElementById('demolishButton');
    const buildingButtons = {
        residential: document.getElementById('residentialButton'),
        industry: document.getElementById('industryButton'),
        commercial: document.getElementById('commercialButton'),
        park: document.getElementById('parkButton'),
        road: document.getElementById('roadButton')
    };
    const overlay = document.getElementById('overlay');
    const overlayCloseButton = document.getElementById('overlayCloseButton');

    const turnDisplay = document.getElementById('turnDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const profitDisplay = document.getElementById('profitDisplay');
    const upkeepDisplay = document.getElementById('upkeepDisplay');

    let gridSize = 5;
    let currentBuilding = '';
    let demolitionMode = false;
    let turn = 1;
    let score = 0;
    let totalProfit = 0;
    let totalUpkeep = 0;

    const upkeepCosts = {
        residential: 1,
        industry: 1,
        commercial: 2,
        park: 1,
        road: 1
    };

    const earningRates = {
        residential: 1,
        industry: 2,
        commercial: 3,
        park: 0,
        road: 0
    };

    let shiftPressed = false;
    let selectedCells = [];
    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    function createGrid(size) {
        cityGrid.innerHTML = '';
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', (event) => handleCellClick(cell, i, event));
            cityGrid.appendChild(cell);
        }
        cityGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    }

    createGrid(gridSize);

    function expandGrid() {
        const oldCells = [...document.querySelectorAll('.cell')];
        gridSize += 2;
        createGrid(gridSize);
        const newCells = document.querySelectorAll('.cell');

        for (let i = 0; i < gridSize - 2; i++) {
            for (let j = 0; j < gridSize - 2; j++) {
                const oldIndex = i * (gridSize - 2) + j;
                const newIndex = (i + 1) * gridSize + (j + 1);
                newCells[newIndex].classList = oldCells[oldIndex].classList;
                newCells[newIndex].innerHTML = oldCells[oldIndex].innerHTML;
                grid[Math.floor(newIndex / gridSize)][newIndex % gridSize] = grid[Math.floor(oldIndex / (gridSize - 2))][oldIndex % (gridSize - 2)];
            }
        }
    }

    function isBorderCell(index, size) {
        const row = Math.floor(index / size);
        const col = index % size;
        return row === 0 || row === size - 1 || col === 0 || col === size - 1;
    }

    function allBordersFilled(size) {
        for (let i = 0; i < size; i++) {
            if (!isOccupied(document.querySelector(`.cell[data-index="${i}"]`)) ||
                !isOccupied(document.querySelector(`.cell[data-index="${size * (size - 1) + i}"]`)) ||
                !isOccupied(document.querySelector(`.cell[data-index="${i * size}"]`)) ||
                !isOccupied(document.querySelector(`.cell[data-index="${i * size + size - 1}"]`))) {
                return false;
            }
        }
        return true;
    }

    function isOccupied(cell) {
        return cell.classList.contains('residential') ||
               cell.classList.contains('industry') ||
               cell.classList.contains('commercial') ||
               cell.classList.contains('park') ||
               cell.classList.contains('road');
    }

    function handleCellClick(cell, index, event) {
        if (demolitionMode) {
            handleDemolition(cell);
        } else if (isOccupied(cell)) {
            if (shiftPressed) {
                handleShiftClick(cell, index);
            } else if (selectedCells.length > 0 && selectedCells.includes(cell)) {
                handleSelectedUpkeep();
            } else {
                handleUpkeep(cell);
            }
        } else {
            placeBuilding(cell, index);
        }
    }

    function handleUpkeep(cell) {
        const buildingType = Array.from(cell.classList).find(cls => cls !== 'cell');
        const upkeepCost = upkeepCosts[buildingType];
        if (upkeepCost && confirm(`This building requires ${upkeepCost} coins for upkeep. Do you want to proceed?`)) {
            totalUpkeep += upkeepCost;
            score -= upkeepCost;
            updateDisplays();
            alert('Upkeep successful!');
        } else {
            alert('Upkeep canceled.');
        }
    }

    function handleShiftClick(cell, index) {
        if (selectedCells.includes(cell)) {
            cell.classList.remove('selected');
            selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);
        } else {
            if (selectedCells.length === 0) {
                cell.classList.add('selected');
                selectedCells.push(cell);
            } else {
                const lastSelectedCell = selectedCells[selectedCells.length - 1];
                if (areCellsConnected(lastSelectedCell, cell)) {
                    cell.classList.add('selected');
                    selectedCells.push(cell);
                } else {
                    alert('Selected buildings for group upkeep must only either be connecting residential buildings or connecting roads.');
                }
            }
        }
    }

    function areCellsConnected(cell1, cell2) {
        const index1 = parseInt(cell1.dataset.index, 10);
        const index2 = parseInt(cell2.dataset.index, 10);
        const row1 = Math.floor(index1 / gridSize);
        const col1 = index1 % gridSize;
        const row2 = Math.floor(index2 / gridSize);
        const col2 = index2 % gridSize;

        const isConnected = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
        const sameType = cell1.classList.contains('residential') && cell2.classList.contains('residential') ||
                         cell1.classList.contains('road') && cell2.classList.contains('road');

        return isConnected && sameType;
    }

    function handleSelectedUpkeep() {
        let totalUpkeepCost = 0;
        let allResidential = true;
        let allRoad = true;

        selectedCells.forEach(cell => {
            if (cell.classList.contains('residential')) {
                allRoad = false;
            } else if (cell.classList.contains('road')) {
                allResidential = false;
            } else {
                allResidential = false;
                allRoad = false;
            }
        });

        if (allResidential || allRoad) {
            totalUpkeepCost = 1;
        } else {
            alert('Only connected residential or road buildings can be selected for group upkeep.');
            return;
        }

        if (totalUpkeepCost && confirm(`The selected buildings require ${totalUpkeepCost} coin for upkeep. Do you want to proceed?`)) {
            totalUpkeep += totalUpkeepCost;
            score -= totalUpkeepCost;
            updateDisplays();
            alert('Upkeep successful!');
            selectedCells.forEach(cell => cell.classList.remove('selected'));
            selectedCells = [];
        } else {
            alert('Upkeep canceled.');
        }
    }

    function placeBuilding(cell, index) {
        const buildingCost = 1;
        if (currentBuilding) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding);

            grid[Math.floor(index / gridSize)][index % gridSize] = currentBuilding;

            const earning = calculateCoinEarnings(currentBuilding);
            totalProfit += earning;
            score += earning - buildingCost;
            updateDisplays();

            if (isBorderCell(index, gridSize) && allBordersFilled(gridSize)) {
                expandGrid();
            }
            currentBuilding = ''; // Reset the current building selection after placement
            hideOverlay();
            turn++;
            updateTurnDisplay();
        } else {
            alert('Select a building first.');
        }
    }

    function calculateCoinEarnings(buildingType) {
        return earningRates[buildingType];
    }

    function updateDisplays() {
        profitDisplay.textContent = totalProfit;
        upkeepDisplay.textContent = totalUpkeep;
        scoreDisplay.textContent = calculateScore();  // Update the score display
        updateTurnDisplay();
    }

    function updateTurnDisplay() {
        turnDisplay.textContent = turn;
    }

    // Calculate scores for different building types
    function calculateScore() {
        let score = 0;
        let industryCount = 0;

        // Calculate score for each type of building
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] !== null) {
                    switch (grid[row][col]) {
                        case 'residential':
                            score += scoreResidential(row, col);
                            break;
                        case 'industry':
                            industryCount++;
                            break;
                        case 'commercial':
                            score += scoreCommercial(row, col);
                            break;
                        case 'park':
                            score += scorePark(row, col);
                            break;
                        case 'road':
                            score += scoreRoad(row, col);
                            break;
                    }
                }
            }
        }
        score += industryCount; // Add the total industry count to the score once
        return score;
    }

    // Helper functions to calculate scores for each type of building
    function scoreResidential(row, col) {
        const neighbors = getNeighbors(row, col);
        let score = 0;
        let nextToIndustry = false;
        for (let neighbor of neighbors) {
            if (grid[neighbor[0]][neighbor[1]] === 'industry') {
                nextToIndustry = true;
                break;
            }
        }
        if (nextToIndustry) {
            return 1;
        }
        for (let neighbor of neighbors) {
            if (grid[neighbor[0]][neighbor[1]] === 'residential' || grid[neighbor[0]][neighbor[1]] === 'commercial') {
                score += 1;
            } else if (grid[neighbor[0]][neighbor[1]] === 'park') {
                score += 2;
            }
        }
        return score;
    }

    function scoreIndustry(row, col) {
        let industryCount = 0;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === 'industry') {
                    industryCount++;
                }
            }
        }
        return industryCount; // Each industry scores based on the total number of industries in the city
    }

    function scoreCommercial(row, col) {
        const neighbors = getNeighbors(row, col);
        let score = 0;
        for (let neighbor of neighbors) {
            if (grid[neighbor[0]][neighbor[1]] === 'commercial') {
                score += 1;
            }
        }
        return score;
    }

    function scorePark(row, col) {
        const neighbors = getNeighbors(row, col);
        let score = 0;
        for (let neighbor of neighbors) {
            if (grid[neighbor[0]][neighbor[1]] === 'park') {
                score += 1;
            }
        }
        return score;
    }

    function scoreRoad(row, col) {
        const neighbors = getNeighbors(row, col);
        let score = 0;
        for (let neighbor of neighbors) {
            if (grid[neighbor[0]][neighbor[1]] === 'road') {
                score += 1;
            }
        }
        return score;
    }

    // Get neighboring cells
    function getNeighbors(row, col) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];
        return directions
            .map(([dx, dy]) => [row + dx, col + dy])
            .filter(([r, c]) => r >= 0 && r < gridSize && c >= 0 && c < gridSize);
    }

    function saveGame() {
        const fileName = prompt("Enter a name for your save game:");
        if (fileName === null || fileName.trim() === '') {
            alert('Save cancelled or invalid name entered.');
            return;
        }

        const existingGameNames = Object.keys(localStorage)
        .filter(key => key.startsWith('gameState_'))
        .map(key => key.replace('gameState_', ''));
        if (existingGameNames.includes(fileName)) {
            alert('A game with this name already exists. Please choose a different name.');
            return;
        }

        const gameState = {
            pageType: window.location.pathname.includes('ArcadeGame') ? 'ArcadeGame' : 'FreePlay',
            gridSize: gridSize,
            score: score,
            turn: turn,
            totalProfit: totalProfit,
            totalUpkeep: totalUpkeep,
            cells: Array.from(document.querySelectorAll('.cell')).map(cell => ({
                classes: Array.from(cell.classList),
                innerHTML: cell.innerHTML
            }))
        };
        localStorage.setItem(`gameState_${fileName}`, JSON.stringify(gameState));
        alert('Game Saved!');
    }

    function loadGameState() {
        const gameState = sessionStorage.getItem('loadedGameState');
        if (!gameState) return;

        const { gridSize: savedGridSize, score: savedScore, turn: savedTurn, totalProfit: savedProfit, totalUpkeep: savedUpkeep, cells: savedCells } = JSON.parse(gameState);

        gridSize = savedGridSize;
        score = savedScore;
        turn = savedTurn;
        totalProfit = savedProfit;
        totalUpkeep = savedUpkeep;
        createGrid(gridSize);

        const cells = document.querySelectorAll('.cell');
        savedCells.forEach((savedCell, index) => {
            cells[index].className = 'cell';
            savedCell.classes.forEach(cls => cells[index].classList.add(cls));
            cells[index].innerHTML = savedCell.innerHTML;
        });

        updateDisplays();
        updateTurnDisplay();
        sessionStorage.removeItem('loadedGameState');
    }

    saveButton.addEventListener('click', saveGame);

    function demolishBuilding() {
        alert('Choose a cell with a building to demolish.');
        demolitionMode = true;
    }

    function handleDemolition(cell) {
        if (isOccupied(cell)) {
            if (confirm('Are you sure you want to demolish this building?')) {
                cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                cell.innerHTML = '';
                totalProfit += 1;
                score += 1;
                updateDisplays();
                alert('Building demolished. You earned 1 coin.');
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false;
    }

    demolishButton.addEventListener('click', demolishBuilding);

    function updateTurnDisplay() {
        turnDisplay.textContent = turn;
    }

    function showOverlay() {
        overlay.classList.add('show');
    }

    function hideOverlay() {
        overlay.classList.remove('show');
    }

    function updateCellIcon(cell, buildingType) {
        let icon;
        switch (buildingType) {
            case 'residential':
                icon = createLordicon("https://cdn.lordicon.com/heexevev.json");
                break;
            case 'industry':
                icon = createLordicon("https://cdn.lordicon.com/zneicxkd.json");
                break;
            case 'commercial':
                icon = createLordicon("https://cdn.lordicon.com/qjxbmwvd.json");
                break;
            case 'park':
                icon = createLordicon("https://cdn.lordicon.com/gfseemfv.json");
                break;
            case 'road':
                icon = createLordicon("https://cdn.lordicon.com/zneicxkd.json");
                break;
            default:
                return;
        }
        cell.innerHTML = '';
        cell.appendChild(icon);
    }

    function createLordicon(src) {
        const icon = document.createElement('lord-icon');
        icon.src = src;
        icon.trigger = 'hover';
        icon.style.width = '40px';
        icon.style.height = '40px';
        return icon;
    }

    buildingButtons.residential.addEventListener('click', () => {
        currentBuilding = 'residential';
        showOverlay();
    });

    buildingButtons.industry.addEventListener('click', () => {
        currentBuilding = 'industry';
        showOverlay();
    });

    buildingButtons.commercial.addEventListener('click', () => {
        currentBuilding = 'commercial';
        showOverlay();
    });

    buildingButtons.park.addEventListener('click', () => {
        currentBuilding = 'park';
        showOverlay();
    });

    buildingButtons.road.addEventListener('click', () => {
        currentBuilding = 'road';
        showOverlay();
    });

    overlayCloseButton.addEventListener('click', () => {
        hideOverlay();
    });

    resetButton.addEventListener('click', () => {
        gridSize = 5;
        turn = 1;
        totalProfit = 0;
        totalUpkeep = 0;
        score = 0;
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)); // Reset grid state
        createGrid(gridSize);
        updateDisplays();
        updateTurnDisplay();
    });

    function saveGame() {
        const fileName = prompt("Enter a name for your save game:");
        if (fileName === null || fileName.trim() === '') {
            alert('Save cancelled or invalid name entered.');
            return;
        }

        const existingGameNames = Object.keys(localStorage)
        .filter(key => key.startsWith('gameState_'))
        .map(key => key.replace('gameState_', ''));
        if (existingGameNames.includes(fileName)) {
            alert('A game with this name already exists. Please choose a different name.');
            return;
        }

        const gameState = {
            pageType: window.location.pathname.includes('ArcadeGame') ? 'ArcadeGame' : 'FreePlay',
            gridSize: gridSize,
            score: score,
            turn: turn,
            totalProfit: totalProfit,
            totalUpkeep: totalUpkeep,
            cells: Array.from(document.querySelectorAll('.cell')).map(cell => ({
                classes: Array.from(cell.classList),
                innerHTML: cell.innerHTML
            }))
        };
        localStorage.setItem(`gameState_${fileName}`, JSON.stringify(gameState));
        alert('Game Saved!');
    }

    function loadGameState() {
        const gameState = sessionStorage.getItem('loadedGameState');
        if (!gameState) return;

        const { gridSize: savedGridSize, score: savedScore, turn: savedTurn, totalProfit: savedProfit, totalUpkeep: savedUpkeep, cells: savedCells } = JSON.parse(gameState);

        gridSize = savedGridSize;
        score = savedScore;
        turn = savedTurn;
        totalProfit = savedProfit;
        totalUpkeep = savedUpkeep;
        createGrid(gridSize);

        const cells = document.querySelectorAll('.cell');
        savedCells.forEach((savedCell, index) => {
            cells[index].className = 'cell';
            savedCell.classes.forEach(cls => cells[index].classList.add(cls));
            cells[index].innerHTML = savedCell.innerHTML;
        });

        updateDisplays();
        updateTurnDisplay();
        sessionStorage.removeItem('loadedGameState');
    }

    saveButton.addEventListener('click', saveGame);

    function demolishBuilding() {
        alert('Choose a cell with a building to demolish.');
        demolitionMode = true;
    }

    function handleDemolition(cell) {
        if (isOccupied(cell)) {
            if (confirm('Are you sure you want to demolish this building?')) {
                cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                cell.innerHTML = '';
                totalProfit += 1;
                score += 1;
                turn++;  // Increment the turn counter
                updateDisplays();
                alert('Building demolished. You earned 1 coin.');
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false;
    }

    demolishButton.addEventListener('click', demolishBuilding);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Shift') {
            shiftPressed = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            shiftPressed = false;
        }
    });

    updateDisplays();
    createGrid(gridSize);
    loadGameState();
});
