document.addEventListener('DOMContentLoaded', () => {
    // Get references to the main elements in the DOM
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

    let gridSize = 5; // Initial grid size
    let coins = 1000; // Initial coins
    let currentBuilding = '';
    let demolitionMode = false; // Flag to indicate if we are in demolition mode

    // Define the upkeep costs for each building type
    const upkeepCosts = {
        residential: 1,
        industry: 1,
        commercial: 2,
        park: 1,
        road: 1
    };

    // Define the earning rates for each building type
    const earningRates = {
        residential: 1,
        industry: 2,
        commercial: 3,
        park: 0, // Parks don't generate coins
        road: 0 // Roads don't generate coins
    };

    // Create the initial grid
    function createGrid(size) {
        cityGrid.innerHTML = ''; // Clear the existing grid
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', (event) => handleCellClick(cell, i, event));
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

    // Handle cell click for both placing and demolishing buildings
    function handleCellClick(cell, index, event) {
        if (demolitionMode) {
            handleDemolition(cell);
        } else {
            placeBuilding(cell, index);
        }
    }

    // Place a building and handle expansion if all border cells are filled
    function placeBuilding(cell, index) {
        const buildingCost = 1; // Base construction cost for any building
        if (coins >= buildingCost) {
            // Check if the cell is occupied by a building
            if (isOccupied(cell)) {
                const buildingType = Array.from(cell.classList).find(cls => cls !== 'cell'); // Get the building type from the cell's class
                console.log("Building type:", buildingType); // Debug statement

                const upkeepCost = upkeepCosts[buildingType]; // Get the upkeep cost
                console.log("Upkeep cost:", upkeepCost); // Debug statement

                if (typeof upkeepCost !== 'undefined') {
                    if (confirm(`This building requires ${upkeepCost} coins for upkeep. Do you want to proceed?`)) {
                        // Deduct upkeep cost from coins
                        coins -= upkeepCost;

                        if (coins >= 0) {
                            console.log(`Building successfully maintained. ${upkeepCost} coins deducted. Current coins: ${coins}`);
                        } else {
                            // If coins are insufficient after upkeep, refund the deducted coins and alert the user
                            coins += upkeepCost;
                            alert("Insufficient coins for upkeep!");
                            updateCoinsDisplay(); // Update coins display after refund
                            return;
                        }

                        updateCoinsDisplay(); // Update coins display after upkeep deduction
                    } else {
                        // User canceled upkeep, return without deducting coins
                        console.log('Upkeep canceled by user.');
                        return;
                    }
                } else {
                    // Upkeep cost is not defined for the building type
                    alert('Upkeep cost is not defined for this building type.');
                    return;
                }
            } else {
                // Cell doesn't contain a building, proceed with construction
                if (currentBuilding) {
                    cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                    cell.classList.add(currentBuilding);
                    updateCellIcon(cell, currentBuilding);

                    // Deduct construction cost from coins
                    coins -= buildingCost;
                    console.log(`Construction successful. ${buildingCost} coins deducted. Current coins: ${coins}`);

                    // Calculate earnings if the building type generates coins
                    const earning = calculateCoinEarnings(currentBuilding);
                    coins += earning; // Add earnings to coins
                    console.log(`Earnings from building: ${earning}. Current coins: ${coins}`);

                    // Update coins display
                    updateCoinsDisplay();

                    if (isBorderCell(index, gridSize) && allBordersFilled(gridSize)) {
                        expandGrid();
                    }
                    currentBuilding = '';
                    hideOverlay();
                } else {
                    alert('Select a building first.');
                }
            }
        } else {
            alert('Insufficient coins to construct the building.');
        }
    }

    // Calculate coin earnings based on building type
    function calculateCoinEarnings(buildingType) {
        return earningRates[buildingType];
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

    // Function to handle demolishing a building
    function demolishBuilding() {
        alert('Choose a cell with a building to demolish.');
        demolitionMode = true; // Set demolition mode to true
    }

    function handleDemolition(cell) {
        if (isOccupied(cell)) {
            if (confirm('Are you sure you want to demolish this building?')) {
                cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road');
                cell.innerHTML = ''; // Remove any icons or inner content
                coins += 1; // Award 1 coin for demolishing the building
                updateCoinsDisplay();
                alert('Building demolished. You earned 1 coin.');
            }
        } else {
            alert('This cell is empty. Choose a cell with a building to demolish.');
        }
        demolitionMode = false; // Reset demolition mode
    }

    // Initialize event listener for the demolish button
    demolishButton.addEventListener('click', demolishBuilding);

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
