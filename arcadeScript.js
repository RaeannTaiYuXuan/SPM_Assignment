document.addEventListener('DOMContentLoaded', () => {
    const cityGridArcade = document.getElementById('cityGridArcade');
    const resetButtonArcade = document.getElementById('resetButtonArcade');
    const saveButtonArcade = document.getElementById('saveButtonArcade');
    const demolishButton = document.getElementById('demolishButton');
    const buildingButtons = {
        residential: document.getElementById('residentialButton'),
        industry: document.getElementById('industryButton'),
        commercial: document.getElementById('commercialButton'),
        park: document.getElementById('parkButton'),
        road: document.getElementById('roadButton')
    };
    const coinsHTML = document.getElementById('coins');
    const scoreDisplay = document.getElementById('scoreDisplay');

    let currentBuilding = '';
    let roundNo = 0;
    let coins = 16;
    const gridSize = 20;
    let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    let demolitionMode = false;
    let gameLoaded = false;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell-arcade');
        cell.dataset.row = Math.floor(i / gridSize);
        cell.dataset.col = i % gridSize;
        cell.addEventListener('click', (event) => handleCellClick(cell, i, event));
        cityGridArcade.appendChild(cell);
    }

    function saveArcadeGame() {
        const fileName = prompt("Enter a name for your save game:");
        if (fileName === null || fileName.trim() === '') {
            alert('Save cancelled or invalid name entered.');
            return;
        }

        const existingGameNames = Object.keys(localStorage)
            .filter(key => key.startsWith('arcadeGameState_'))
            .map(key => key.replace('arcadeGameState_', ''));
        if (existingGameNames.includes(fileName)) {
            alert('A game with this name already exists. Please choose a different name.');
            return;
        }

        const gameState = {
            pageType: 'ArcadeGame',
            coins: coins,
            roundNo: roundNo,
            grid: grid,
            cells: Array.from(document.querySelectorAll('.cell-arcade')).map(cell => ({
                classes: Array.from(cell.classList),
                innerHTML: cell.innerHTML
            })),
            score: calculateScore() // Ensure score is saved correctly
        };
        localStorage.setItem(`arcadeGameState_${fileName}`, JSON.stringify(gameState));
        alert('Game Saved!');
    }

    saveButtonArcade.addEventListener('click', saveArcadeGame);

    function loadGameState() {
        const gameState = sessionStorage.getItem('loadedGameState');
        if (!gameState) return;

        const { coins: savedCoins, roundNo: savedRoundNo, grid: savedGrid, cells: savedCells, score: savedScore } = JSON.parse(gameState);

        coins = savedCoins + 1; // Add one coin to the saved state
        roundNo = savedRoundNo;
        grid = savedGrid;
        gameLoaded = true; // Indicate that the game has been loaded

        const cells = document.querySelectorAll('.cell-arcade');
        savedCells.forEach((savedCell, index) => {
            cells[index].className = 'cell-arcade';
            savedCell.classes.forEach(cls => cells[index].classList.add(cls));
            cells[index].innerHTML = savedCell.innerHTML;
        });

        coinsHTML.textContent = `Coins: ${coins}`;
        scoreDisplay.textContent = `Score: ${savedScore}`;
        sessionStorage.removeItem('loadedGameState');

        updateScoreDisplay(); // Ensure score is updated correctly
        updateCoinsDisplay(); // Ensure coins are updated correctly

        // Disable all building buttons initially
        greyOutBuildings([]);

        // Determine which buildings should be available based on the current game state
        if (coins > 0) {
            const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
            let selectedBuildings = [];
            while (selectedBuildings.length < 2) {
                const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
                if (!selectedBuildings.includes(randomBuilding)) {
                    selectedBuildings.push(randomBuilding);
                }
            }
            greyOutBuildings(selectedBuildings);
        }
    }

    function resetGrid() {
        const cells = document.querySelectorAll('.cell-arcade');
        cells.forEach(cell => {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
            cell.innerHTML = '';
        });
        grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
        coins = 16;
        roundNo = 0;
        updateScoreDisplay();
        startNewRound();
    }

    resetButtonArcade.addEventListener('click', resetGrid);

    function startNewRound() {
        if (gameLoaded) {
            gameLoaded = false;
            return;
        }
        generateCoinsForAllBuildings();
        coinsHTML.textContent = `Coins: ${coins}`;
        if (coins > 0) {
            roundNo++;
            coins--;
            const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
            let selectedBuildings = [];
            while (selectedBuildings.length < 2) {
                const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
                if (!selectedBuildings.includes(randomBuilding)) {
                    selectedBuildings.push(randomBuilding);
                }
            }
            currentBuilding = '';
            greyOutBuildings(selectedBuildings);
        } else {
            alert('You have no more coins!');
        }
        updateScoreDisplay();
    }

    function greyOutBuildings(selectedBuildings) {
        for (const building in buildingButtons) {
            if (selectedBuildings.includes(building)) {
                buildingButtons[building].disabled = false;
                buildingButtons[building].classList.remove('greyed-out');
                buildingButtons[building].addEventListener('click', handleBuildingClick);
            } else {
                buildingButtons[building].disabled = true;
                buildingButtons[building].classList.add('greyed-out');
                buildingButtons[building].removeEventListener('click', handleBuildingClick);
            }
        }
    }

    function handleBuildingClick(event) {
        const building = event.currentTarget.id.replace('Button', '');
        currentBuilding = building;
    }

    function handleCellClick(cell, index, event) {
        if (demolitionMode) {
            handleDemolition(cell, index);
        } else {
            placeBuilding(cell, index);
        }
    }

    function placeBuilding(cell, index) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (grid[row][col] !== null) {
            alert('This cell is already occupied.');
            return;
        }

        if (currentBuilding && (roundNo === 1 || isNextToExistingBuilding(row, col) || isDiagonalToExistingBuilding(row, col))) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding);
            grid[row][col] = currentBuilding;
            currentBuilding = '';
            startNewRound();
        } else if (roundNo !== 1) {
            alert('You can only build next to existing buildings or diagonally.');
        } else {
            alert('Select a building first.');
        }
        updateScoreDisplay();
    }

    function generateCoinsForAllBuildings() {
        let additionalCoins = 0;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] === 'industry') {
                    additionalCoins += countAdjacentBuildings(row, col, 'residential');
                }
                if (grid[row][col] === 'commercial') {
                    additionalCoins += countAdjacentBuildings(row, col, 'residential');
                }
            }
        }
        coins += additionalCoins;
        coinsHTML.textContent = `Coins: ${coins}`;
    }

    function countAdjacentBuildings(row, col, buildingType) {
        const neighbors = getNeighbors(row, col);
        return neighbors.filter(([r, c]) => grid[r][c] === buildingType).length;
    }

    function isNextToExistingBuilding(row, col) {
        const directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0]
        ];
        return directions.some(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            return newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && grid[newRow][newCol];
        });
    }

    function isDiagonalToExistingBuilding(row, col) {
        const directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];
        return directions.some(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            return newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && grid[newRow][newCol];
        });
    }

    function updateCellIcon(cell, buildingType) {
        let icon;
        switch (buildingType) {
            case 'residential':
                icon = createLordicon("https://cdn.lordicon.com/heexevev.json");
                break;
            case 'industry':
                icon = createGifIcon("icons8-industrial.gif", 25, 25); // Resized to 30x30
                break;
            case 'commercial':
                icon = createLordicon("https://cdn.lordicon.com/qjxbmwvd.json");
                break;
            case 'park':
                icon = createLordicon("https://cdn.lordicon.com/nbktuufg.json");
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

    function createGifIcon(src, width, height) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.style.width = `${width}px`;
        icon.style.height = `${height}px`;
        return icon;
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
            [-1, -1], [-1, 1],
            [1, -1], [1, 1]
        ];
        return directions
            .map(([dx, dy]) => [row + dx, col + dy])
            .filter(([r, c]) => r >= 0 && r < gridSize && c >= 0 && c < gridSize);
    }

    function demolishBuilding() {
        alert('Choose a cell with a building to demolish.');
        demolitionMode = true;
    }

    function handleDemolition(cell, index) {
        if (isOccupied(cell)) {
            if (confirm('Are you sure you want to demolish this building?')) {
                const buildingType = Array.from(cell.classList).find(cls => cls !== 'cell-arcade');
                cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                cell.innerHTML = '';
                grid[Math.floor(index / gridSize)][index % gridSize] = null;
                coins += 1;
                coinsHTML.textContent = `Coins: ${coins}`;
                alert('Building demolished. You earned 1 coin.');
                updateScoreDisplay();
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false;
    }

    demolishButton.addEventListener('click', demolishBuilding);

    function updateScoreDisplay() {
        const score = calculateScore();
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function updateCoinsDisplay() {
        coinsHTML.textContent = `Coins: ${coins}`;
    }

    loadGameState();
    if (!gameLoaded) {
        startNewRound();
    }
});
