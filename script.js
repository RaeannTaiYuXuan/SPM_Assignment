// Variables to track if the game was loaded and the game name
let isLoadedGame = false;
let loadedGameName = '';

let gridSize = 5;
let currentBuilding = '';
let demolitionMode = false;
let turn = 1;
let score = 0;
let totalProfit = 0;
let totalUpkeep = 0;
let consecutiveLosingTurns = 0;
let previousProfit = 0;

const upkeepCosts = {
    residential: 1,
    industry: 1,
    commercial: 2,
    park: 1,
    road: 1
};

const coinsGenerated = {
    residential: 1,
    industry: 2,
    commercial: 3,
    park: 0,
    road: 0
}

const earningRates = {
    residential: coinsGenerated.residential - upkeepCosts.residential,
    industry: coinsGenerated.industry - upkeepCosts.industry,
    commercial: coinsGenerated.commercial - upkeepCosts.commercial,
    park: coinsGenerated.park - upkeepCosts.park,
    road: coinsGenerated.road - upkeepCosts.road
};

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

    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    // SIDE BAR :
     function openNav() {
        document.getElementById("mySidebar").style.width = "450px";
    }

    function closeNav() {
        document.getElementById("mySidebar").style.width = "0";
    }
    document.querySelector('.openbtn').addEventListener('click', openNav);
    document.querySelector('.closebtn').addEventListener('click', closeNav);

    function createGrid(size) {
        cityGrid.innerHTML = '';
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (size > 5) {
                cell.classList.add('cell-arcade');
            }
            cell.dataset.index = i;
            cell.addEventListener('click', (event) => handleCellClick(cell, i, event));
            cityGrid.appendChild(cell);
        }
        cityGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        if (size > 5) {
            cityGrid.classList.add('city-grid-arcade');
        } else {
            cityGrid.classList.remove('city-grid-arcade');
        }
        grid = Array(size).fill(null).map(() => Array(size).fill(null));
    }

    createGrid(gridSize);

    function isBorderCell(index, size) {
        const row = Math.floor(index / size);
        const col = index % size;
        return row === 0 || row === size - 1 || col === 0 || col === size - 1;
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
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
    
        if (currentBuilding) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding, row, col);
    
            grid[row][col] = currentBuilding;
    
            const earning = calculateCoinEarnings(currentBuilding);
            totalProfit += earning;
    
            // Calculate score after placing the building and add to saved score
            score += calculateScore();
    
            console.log('Score after placing building:', score); // Debugging log
    
            updateDisplays();
    
            if (isBorderCell(index, gridSize)) {
                // Temporarily store the current state of buildings
                const currentBuildings = [];
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        if (grid[i][j] !== null) {
                            currentBuildings.push({ row: i, col: j, type: grid[i][j] });
                        }
                    }
                }
    
                expandGrid();
    
                // Re-apply the buildings to the new expanded grid
                for (const building of currentBuildings) {
                    const newRow = building.row + 5; // Adjust the offset according to the expandGrid logic
                    const newCol = building.col + 5; // Adjust the offset according to the expandGrid logic
                    const newIndex = newRow * gridSize + newCol;
                    const newCell = document.querySelector(`.cell[data-index="${newIndex}"]`);
                    newCell.classList.add(building.type);
                    updateCellIcon(newCell, building.type, newRow, newCol);
                    grid[newRow][newCol] = building.type;
                }
            }
    
            currentBuilding = '';
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
        scoreDisplay.textContent = score; // Ensure this uses the score variable directly
        updateTurnDisplay();
    
        console.log('Displayed Score:', score); // Debugging log
    }
    
    
    

    function updateTurnDisplay() {
        turnDisplay.textContent = turn;
    }

    function calculateScore() {
        let score = 0;
        let industryCount = 0;

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
        score += industryCount;
        return score;
    }

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
        return industryCount;
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

    function getNeighbors(row, col) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        return directions
            .map(([dx, dy]) => [row + dx, col + dy])
            .filter(([r, c]) => r >= 0 && r < gridSize && c >= 0 && c < gridSize);
    }

    function saveGame() {
        if (isLoadedGame) {
            const gameState = {
                pageType: 'FreePlay',
                gridSize: gridSize,
                score: score, // Save the current score
                turn: turn,
                totalProfit: totalProfit,
                totalUpkeep: totalUpkeep,
                consecutiveLosingTurns: consecutiveLosingTurns,
                previousProfit: previousProfit,
                grid: grid,
                cells: Array.from(document.querySelectorAll('.cell')).map(cell => ({
                    classes: Array.from(cell.classList),
                    innerHTML: cell.innerHTML
                }))
            };
            localStorage.setItem(`gameState_${loadedGameName}`, JSON.stringify(gameState));
            alert('Game saved!');
            return;
        }
    
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
            pageType: 'FreePlay',
            gridSize: gridSize,
            score: score, // Save the current score
            turn: turn,
            totalProfit: totalProfit,
            totalUpkeep: totalUpkeep,
            consecutiveLosingTurns: consecutiveLosingTurns,
            previousProfit: previousProfit,
            grid: grid,
            cells: Array.from(document.querySelectorAll('.cell')).map(cell => ({
                classes: Array.from(cell.classList),
                innerHTML: cell.innerHTML
            }))
        };
        localStorage.setItem(`gameState_${fileName}`, JSON.stringify(gameState));
        alert('Game Saved!');
    }
        
    window.addEventListener('beforeunload', () => {
        const gameState = {
            gridSize: gridSize,
            score: score,
            turn: turn,
            totalProfit: totalProfit,
            totalUpkeep: totalUpkeep,
            consecutiveLosingTurns: consecutiveLosingTurns,
            previousProfit: previousProfit,
            grid: grid,
            cells: Array.from(document.querySelectorAll('.cell')).map(cell => ({
                classes: Array.from(cell.classList),
                innerHTML: cell.innerHTML
            }))
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
    });

    // CHANGED: Updated loadGameState function to properly load FreePlay mode state
    function loadGameState() {
        const gameState = sessionStorage.getItem('loadedGameState');
        if (!gameState) return;
    
        const { gridSize: savedGridSize, score: savedScore, turn: savedTurn, totalProfit: savedProfit, totalUpkeep: savedUpkeep, consecutiveLosingTurns: savedConsecutiveLosingTurns, previousProfit: savedPreviousProfit, grid: savedGrid, cells: savedCells } = JSON.parse(gameState);
    
        console.log('Loaded Score:', savedScore); // Debugging log
    
        gridSize = savedGridSize;
        score += savedScore; // Add saved score to the current score
        turn = savedTurn;
        totalProfit = savedProfit;
        totalUpkeep = savedUpkeep;
        consecutiveLosingTurns = savedConsecutiveLosingTurns;
        previousProfit = savedPreviousProfit;
        grid = savedGrid;
        createGrid(gridSize);
    
        const cells = document.querySelectorAll('.cell');
        savedCells.forEach((savedCell, index) => {
            cells[index].className = 'cell';
            savedCell.classes.forEach(cls => cells[index].classList.add(cls));
            cells[index].innerHTML = savedCell.innerHTML;
        });
    
        updateDisplays(); // Ensure displays are updated after loading the game state
        updateTurnDisplay();
    
        if (gridSize > 5) {
            document.body.classList.add('grid-expanded');
            document.querySelector('.toolbar').classList.add('toolbar-small');
        }
    
        isLoadedGame = true;
        loadedGameName = sessionStorage.getItem('loadedGameName') || '';
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
                processTurn();
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false;
    }

    demolishButton.addEventListener('click', demolishBuilding);

    function processTurn() {
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
    
        totalUpkeep = upkeepCost;
    
        // Log the current score and upkeep cost for debugging
        console.log('Current Score before upkeep:', score);
        console.log('Upkeep Cost:', upkeepCost);
    
        // Deduct upkeep cost from score
        score -= upkeepCost;
    
        // Ensure score does not go below 1
        if (score < 1) {
            score = 1;
        }
    
        console.log('Score after upkeep deduction:', score);
    
        if (totalProfit === previousProfit) {
            consecutiveLosingTurns++;
        } else {
            consecutiveLosingTurns = 0;
        }
        previousProfit = totalProfit;
    
        if (consecutiveLosingTurns >= 20) {
            alert('Game Over: The city has been making a loss for 20 consecutive turns.');
            resetGame();
        }
    
        // Recalculate the score after processing the turn
        score += calculateScore();
    
        updateDisplays();
    
        turn++;
        updateTurnDisplay();
    
        console.log('Score after processing turn:', score);
    }
                            
    function resetGame() {
        gridSize = 5;
        turn = 1;
        totalProfit = 0;
        totalUpkeep = 0;
        score = 0;
        consecutiveLosingTurns = 0;
        previousProfit = 0;
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
        createGrid(gridSize);
        updateDisplays();
        updateTurnDisplay();
    }

    function getConnectedCells(row, col, buildingType) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
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

    function roadOrientation(row, col, gridSize) {
        const middleValue = Math.floor(gridSize / 2) + 1;
        const horizontalValues = [];
    
        let cornerValues = {
            'topLeftCorner': [0, 0],
            'bottomLeftCorner': [gridSize - 1, 0],
            'topRightCorner': [0, gridSize - 1],
            'bottomRightCorner': [gridSize - 1, gridSize - 1]
        };
        let innerboxes = [];
        innerboxes.push(cornerValues);
    
        let count = 0;
        while (count < middleValue - 1) {
            count++;
            let newCornerValues = {
                'topLeftCorner': [innerboxes[count - 1]['topLeftCorner'][0] + 1, innerboxes[count - 1]['topLeftCorner'][1] + 1],
                'bottomLeftCorner': [innerboxes[count - 1]['bottomLeftCorner'][0] - 1, innerboxes[count - 1]['bottomLeftCorner'][1] + 1],
                'topRightCorner': [innerboxes[count - 1]['topRightCorner'][0] + 1, innerboxes[count - 1]['topRightCorner'][1] - 1],
                'bottomRightCorner': [innerboxes[count - 1]['bottomRightCorner'][0] - 1, innerboxes[count - 1]['bottomRightCorner'][1] - 1]
            };
            innerboxes.push(newCornerValues);
        }

        let countHorizontal = 0;
        let startValue = 1;
        let endValue = gridSize;

        while (countHorizontal < middleValue - 1) {
            let colValues = [];
            for (let i = startValue; i < endValue; i++) {
                colValues.push(i);
            }
            let match = {};
            match[countHorizontal] = colValues;
            countHorizontal++;
            startValue++;
            endValue--;
            horizontalValues.push(match);
        }

        if (row === middleValue - 1 && col === middleValue - 1) {
            return 'default';
        } 
        if (innerboxes.length > 0) {
            let placement = [row, col];
            for (const box of innerboxes) {
                for (const [key, value] of Object.entries(box)) {
                    if (placement[0] === value[0] && placement[1] === value[1]) {
                        return key;
                    }
                }
            }
        } 
        if (horizontalValues.length > 0) {
            for (const horizontalRow of horizontalValues) {
                for (const [key, value] of Object.entries(horizontalRow)) {
                    if (row === parseInt(key) && value.includes(col)) {
                        return 'horizontal';
                    }
                }
            }
        }

        return 'none';
    }
    
    function updateCellIcon(cell, buildingType, row, col) {
        let icon;
        switch (buildingType) {
            case 'residential':
                icon = createLordicon("https://cdn.lordicon.com/heexevev.json");
                break;
            case 'industry':
                icon = createGifIcon("icons8-industrial.gif", 40, 40);
                break;
            case 'commercial':
                icon = createLordicon("https://cdn.lordicon.com/qjxbmwvd.json");
                break;
            case 'park':
                icon = createLordicon("https://cdn.lordicon.com/nbktuufg.json");
                break;
            case 'road':
                const orientation = roadOrientation(row, col, gridSize);
                if (orientation === 'horizontal') {
                    icon = createImage("road_horizontal.png", "road-horizontal-animation");
                } else if (orientation === 'topLeftCorner') {
                    icon = createImage("road_top_left.png", "road-top-left-animation");
                } else if (orientation === 'bottomLeftCorner') {
                    icon = createImage("road_bottom_left.png", "road-bottom-left-animation");
                } else if (orientation === 'topRightCorner') {
                    icon = createImage("road_top_right.png", "road-top-right-animation");
                } else if (orientation === 'bottomRightCorner') {
                    icon = createImage("road_bottom_right.png", "road-bottom-right-animation");
                } else if (orientation === 'none'){
                    icon = createImage("road.png", "road-default-animation");
                } else {
                    icon = createImage("road.png", "road-default-animation");
                }
                break;
        }

        cell.innerHTML = '';
        cell.appendChild(icon);
    }

    function createImage(src, animationClass) {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('icon-image');
        if (animationClass) {
            img.classList.add(animationClass);
        }
        img.style.width = '100%';
        img.style.height = '100%';
        return img;
    }

    function createLordicon(src) {
        const icon = document.createElement('lord-icon');
        icon.src = src;
        icon.trigger = 'hover';
        icon.style.width = '40px';
        icon.style.height = '40px';
        return icon;
    }

    function createGifIcon(src, width, height) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.style.width = `${width}px`;
        icon.style.height = `${height}px`;
        return icon;
    }

    function isGridFull() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    function expandGrid() {
        const oldGrid = grid;
        const oldCells = [...document.querySelectorAll('.cell')];
        const oldSize = gridSize;
        gridSize += 10; // Increase the grid size by 10
        createGrid(gridSize);
        const newCells = document.querySelectorAll('.cell');
    
        const offset = Math.floor((gridSize - oldSize) / 2);
    
        for (let row = 0; row < oldGrid.length; row++) {
            for (let col = 0; col < oldGrid[row].length; col++) {
                if (oldGrid[row][col] !== null) {
                    const oldIndex = row * oldSize + col;
                    const newIndex = (row + offset) * gridSize + (col + offset);
                    newCells[newIndex].classList.add(oldGrid[row][col]);
                    newCells[newIndex].classList.add('cell-arcade');
                    updateCellIcon(newCells[newIndex], oldGrid[row][col], row, col);
                    grid[row + offset][col + offset] = oldGrid[row][col];
                }
            }
        }
    
        // Adjust the CSS to make the screen smaller and the buttons lower
        document.body.classList.add('grid-expanded');
        cityGrid.style.transform = 'scale(0.75)'; // Scale down the grid
        cityGrid.style.transformOrigin = 'center'; // Set the origin of scaling
    
        // Move button container lower
        document.querySelector('.button-container').style.marginTop = '150px';
        document.querySelector('.toolbar').style.marginTop = '100px';
    
        alert(`Grid expanded to ${gridSize}x${gridSize}!`);
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
        consecutiveLosingTurns = 0;
        previousProfit = 0;
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
        createGrid(gridSize);
        updateDisplays();
        updateTurnDisplay();
    
        // Remove the grid-expanded class and reset styles
        document.body.classList.remove('grid-expanded');
        document.querySelector('.button-container').style.marginTop = '';
        document.querySelector('.toolbar').style.marginTop = '';
        cityGrid.style.transform = '';
        cityGrid.style.transformOrigin = '';
    
        document.querySelector('.toolbar').classList.remove('toolbar-small');
    });
    

    updateDisplays();
    createGrid(gridSize);
    
    // Only load game state if it was set to be loaded (from 'Load Saved Game')
    if (sessionStorage.getItem('loadedGameState')) {
        loadGameState();
    }
    
});
