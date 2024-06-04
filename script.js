document.addEventListener('DOMContentLoaded', () => {
    // Get references to the main elements in the DOM
    const cityGrid = document.getElementById('cityGrid');
    const resetButton = document.getElementById('resetButton');
    const saveButton = document.getElementById('saveButton');
    const buildingButtons = {
        residential: document.getElementById('residentialButton'),
        industry: document.getElementById('industryButton'),
        commercial: document.getElementById('commercialButton'),
        park: document.getElementById('parkButton'),
        road: document.getElementById('roadButton')
    };
    const overlay = document.getElementById('overlay');
    const overlayCloseButton = document.getElementById('overlayCloseButton');

    let gridSize = 5; // Initial grid size
    let coins = 1000; // Initial coins
    let currentBuilding = '';

    // Create the initial grid
    function createGrid(size) {
        cityGrid.innerHTML = ''; // Clear the existing grid
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', () => placeBuilding(cell, i));
            cityGrid.appendChild(cell);
        }
        cityGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    }

    createGrid(gridSize); // Create the initial 5x5 grid

    // Expand the grid by adding one row/column on each side
    function expandGrid() {
        const oldCells = [...document.querySelectorAll('.cell')]; // Save the current cells
        gridSize += 2; // Increase the grid size by 2 which is 1 row/column on each side
        createGrid(gridSize); // Create the new expanded grid
        const newCells = document.querySelectorAll('.cell'); // Get the new cells

        // Copy old cells back to the new grid
        for (let i = 0; i < gridSize - 2; i++) {
            for (let j = 0; j < gridSize - 2; j++) {
                const oldIndex = i * (gridSize - 2) + j;
                const newIndex = (i + 1) * gridSize + (j + 1);
                newCells[newIndex].classList = oldCells[oldIndex].classList;
                newCells[newIndex].innerHTML = oldCells[oldIndex].innerHTML;
            }
        }
    }

    // Check if a cell is on the border of the grid
    function isBorderCell(index, size) {
        const row = Math.floor(index / size);
        const col = index % size;
        return row === 0 || row === size - 1 || col === 0 || col === size - 1;
    }

    // Check if all border cells are filled with buildings
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

    // Check if a cell is occupied by a building
    function isOccupied(cell) {
        return cell.classList.contains('residential') ||
               cell.classList.contains('industry') ||
               cell.classList.contains('commercial') ||
               cell.classList.contains('park') ||
               cell.classList.contains('road');
    }

    // Place a building and handle expansion if all border cells are filled
    function placeBuilding(cell, index) {
        if (currentBuilding) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding);
            if (isBorderCell(index, gridSize) && allBordersFilled(gridSize)) {
                expandGrid();
            }
            currentBuilding = '';
            hideOverlay();
        } else {
            alert('Select a building first.');
        }
    }

    // Initialize event listeners for building buttons
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

    // Reset grid and coins
    resetButton.addEventListener('click', () => {
        coins = 1000;
        gridSize = 5;
        createGrid(gridSize);
        updateCoinsDisplay();
    });

    // Function to save the current game state
    function saveGame() {
        const gameState = {
            gridSize: gridSize,
            coins: coins,
            cells: Array.from(document.querySelectorAll('.cell')).map(cell => ({
                classes: Array.from(cell.classList),
                innerHTML: cell.innerHTML
            }))
        };
        localStorage.setItem('freePlayGameState', JSON.stringify(gameState));
        alert('Game Saved!');
    }

    // Attach the save button event listener
    saveButton.addEventListener('click', saveGame);

    // Update the coin display
    function updateCoinsDisplay() {
        document.querySelector('.left-content').textContent = `$${coins}`;
    }

    // Show and hide overlay functions
    function showOverlay() {
        overlay.classList.add('show');
    }

    function hideOverlay() {
        overlay.classList.remove('show');
    }

    // Update cell icon function
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

    // Initial setup
    updateCoinsDisplay();
    createGrid(gridSize);
});
