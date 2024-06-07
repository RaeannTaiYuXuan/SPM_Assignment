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
    let coins = 1000;
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
            handleUpkeep(cell);
        } else {
            placeBuilding(cell, index);
        }
    }

    function handleUpkeep(cell) {
        const buildingType = Array.from(cell.classList).find(cls => cls !== 'cell');
        const upkeepCost = upkeepCosts[buildingType];
        if (upkeepCost && confirm(`This building requires ${upkeepCost} coins for upkeep. Do you want to proceed?`)) {
            totalUpkeep += upkeepCost;
            coins -= upkeepCost;
            updateDisplays();
            alert('Upkeep successful!');
        } else {
            alert('Upkeep canceled.');
        }
    }

    function placeBuilding(cell, index) {
        const buildingCost = 1;
        if (coins >= buildingCost) {
            if (currentBuilding) {
                cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                cell.classList.add(currentBuilding);
                updateCellIcon(cell, currentBuilding);

                coins -= buildingCost;
                const earning = calculateCoinEarnings(currentBuilding);
                totalProfit += earning;
                
                coins += earning;

                updateDisplays();

                if (isBorderCell(index, gridSize) && allBordersFilled(gridSize)) {
                    expandGrid();
                }
                currentBuilding = '';
                hideOverlay();
                turn++;
                updateTurnDisplay();
            } else {
                alert('Select a building first.');
            }
        } else {
            alert('Insufficient coins to construct the building.');
        }
    }

    function calculateCoinEarnings(buildingType) {
        return earningRates[buildingType];
    }

    function updateDisplays() {
        profitDisplay.textContent = totalProfit;
        upkeepDisplay.textContent = totalUpkeep;
        scoreDisplay.textContent = coins;
        updateCoinsDisplay();
    }

    function updateTurnDisplay() {
        turnDisplay.textContent = turn;
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
        coins = 1000;
        gridSize = 5;
        turn = 1;
        totalProfit = 0;
        totalUpkeep = 0;
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
            coins: coins,
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

        const { gridSize: savedGridSize, coins: savedCoins, turn: savedTurn, totalProfit: savedProfit, totalUpkeep: savedUpkeep, cells: savedCells } = JSON.parse(gameState);

        gridSize = savedGridSize;
        coins = savedCoins;
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
                coins += 1;
                updateDisplays();
                alert('Building demolished. You earned 1 coin.');
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false;
    }

    demolishButton.addEventListener('click', demolishBuilding);

    function updateCoinsDisplay() {
        scoreDisplay.textContent = coins;
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

    updateDisplays();
    createGrid(gridSize);
    loadGameState();
});
