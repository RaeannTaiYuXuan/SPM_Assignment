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
    let consecutiveLosingTurns = 0; // New variable to track consecutive losing turns

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
            handleDemolition(cell, index);
        } else if (!isOccupied(cell)) {
            placeBuilding(cell, index);
        }
    }

    function placeBuilding(cell, index) {
        const buildingCost = 1;
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        if (currentBuilding) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding);

            grid[row][col] = currentBuilding;

            const earning = calculateCoinEarnings(currentBuilding);
            totalProfit += earning;
            score += earning - buildingCost;
            updateDisplays();

            if (isBorderCell(index, gridSize) && allBordersFilled(gridSize)) {
                expandGrid();
            }
            currentBuilding = ''; // Reset the current building selection after placement
            processTurn();
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
            [-1, 0], [1, 0], [0, -1], [0, 1], // up, down, left, right
            [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonals
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

    function handleDemolition(cell, index) {
        if (isOccupied(cell)) {
            if (confirm('Are you sure you want to demolish this building?')) {
                const buildingType = Array.from(cell.classList).find(cls => cls !== 'cell');
                cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                cell.innerHTML = '';
                grid[Math.floor(index / gridSize)][index % gridSize] = null;
                totalProfit += 1;
                score += 1;
                updateDisplays();
                alert('Building demolished. You earned 1 coin.');
                processTurn();  // Automatic upkeep after demolition
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false;
    }

    demolishButton.addEventListener('click', demolishBuilding);

    function processTurn() {
        // Automatically calculate upkeep costs
        let upkeepCost = 0;
        const visited = new Set();

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const buildingType = grid[row][col];
                const cellKey = `${row},${col}`;
                if (buildingType && !visited.has(cellKey)) {
                    if (buildingType === 'residential' || buildingType === 'road') {
                        const connectedCells = getConnectedCells(row, col, buildingType);
                        connectedCells.forEach(cell => visited.add(cell));
                        upkeepCost += upkeepCosts[buildingType];
                    } else {
                        upkeepCost += upkeepCosts[buildingType];
                    }
                }
            }
        }

        totalUpkeep += upkeepCost;
        score -= upkeepCost;

        // Check if the city is making a profit or loss
        if (totalProfit < totalUpkeep) {
            consecutiveLosingTurns++;
        } else {
            consecutiveLosingTurns = 0;
        }

        if (consecutiveLosingTurns >= 20) {
            alert('Game Over: The city has been making a loss for 20 consecutive turns.');
            // Optionally, you can reset the game or take other actions here
        }

        // Update displays
        updateDisplays();
        
        // Increment the turn
        turn++;
        updateTurnDisplay();
    }

    function getConnectedCells(row, col, buildingType) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];
        const stack = [[row, col]];
        const connectedCells = new Set([`${row},${col}`]);

        while (stack.length) {
            const [currentRow, currentCol] = stack.pop();
            for (const [dx, dy] of directions) {
                const newRow = currentRow + dx;
                const newCol = currentCol + dy;
                const cellKey = `${newRow},${newCol}`;
                if (
                    newRow >= 0 && newRow < gridSize &&
                    newCol >= 0 && newCol < gridSize &&
                    !connectedCells.has(cellKey) &&
                    grid[newRow][newCol] === buildingType
                ) {
                    stack.push([newRow, newCol]);
                    connectedCells.add(cellKey);
                }
            }
        }

        return connectedCells;
    }

    function updateTurnDisplay() {
        turnDisplay.textContent = turn;
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
    });

    buildingButtons.industry.addEventListener('click', () => {
        currentBuilding = 'industry';
    });

    buildingButtons.commercial.addEventListener('click', () => {
        currentBuilding = 'commercial';
    });

    buildingButtons.park.addEventListener('click', () => {
        currentBuilding = 'park';
    });

    buildingButtons.road.addEventListener('click', () => {
        currentBuilding = 'road';
    });

    resetButton.addEventListener('click', () => {
        gridSize = 5;
        turn = 1;
        totalProfit = 0;
        totalUpkeep = 0;
        score = 0;
        consecutiveLosingTurns = 0; // Reset consecutive losing turns counter
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)); // Reset grid state
        createGrid(gridSize);
        updateDisplays();
        updateTurnDisplay();
    });

    updateDisplays();
    createGrid(gridSize);
    loadGameState();
});
