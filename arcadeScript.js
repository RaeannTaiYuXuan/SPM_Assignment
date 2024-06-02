// Run the script once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the main elements in the DOM
    const cityGridArcade = document.getElementById('cityGridArcade');
    const resetButtonArcade = document.getElementById('resetButtonArcade');
    const buildingButtons = {
        residential: document.getElementById('residentialButton'),
        industry: document.getElementById('industryButton'),
        commercial: document.getElementById('commercialButton'),
        park: document.getElementById('parkButton'),
        road: document.getElementById('roadButton')
    };

    // Initialize game variables
    let currentBuilding = ''; // Tracks the currently selected building
    let roundNo = 0; // Tracks the current round number
    let coins = 16; // Tracks the number of coins remaining
    const gridSize = 20; // Size of the grid (20x20)
    let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null)); // 2D array to keep track of grid state

    // Create the 20x20 grid dynamically
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div'); // Create a new div element for each cell
        cell.classList.add('cell-arcade'); // Add a class for styling
        cell.dataset.row = Math.floor(i / gridSize); // Store row index in data attribute
        cell.dataset.col = i % gridSize; // Store column index in data attribute
        cell.addEventListener('click', () => placeBuilding(cell)); // Add click event listener to place a building
        cityGridArcade.appendChild(cell); // Append the cell to the grid container
    }

    // Start a new round of the game
    function startNewRound() {
        if (coins > 0) { // Check if there are coins left
            roundNo++; // Increment the round number
            coins--; // Decrement the number of coins
            const buildings = ['residential', 'industry', 'commercial', 'park', 'road']; // List of possible buildings
            let selectedBuildings = [];
            while (selectedBuildings.length < 2) { // Select two random buildings
                const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
                if (!selectedBuildings.includes(randomBuilding)) {
                    selectedBuildings.push(randomBuilding);
                }
            }
            console.log('Selected Buildings:', selectedBuildings); // Log selected buildings
            currentBuilding = ''; // Reset current building to force user to select one of the available options
            greyOutBuildings(selectedBuildings); // Grey out the unselected buildings
        } else {
            alert('You have no more coins!'); // Alert the user if no coins are left
        }
    }

    // Grey out the buildings that are not selected for this round
    function greyOutBuildings(selectedBuildings) {
        for (const building in buildingButtons) {
            if (selectedBuildings.includes(building)) {
                buildingButtons[building].disabled = false; // Enable the selected building buttons
                buildingButtons[building].classList.remove('greyed-out'); // Remove greyed-out class
                buildingButtons[building].addEventListener('click', handleBuildingClick); // Add event listener
            } else {
                buildingButtons[building].disabled = true; // Disable the unselected building buttons
                buildingButtons[building].classList.add('greyed-out'); // Add greyed-out class
                buildingButtons[building].removeEventListener('click', handleBuildingClick); // Remove event listener
            }
        }
    }

    // Handle the building button click event
    function handleBuildingClick(event) {
        const building = event.currentTarget.id.replace('Button', ''); // Get the building type from the button ID
        currentBuilding = building; // Set the current building
        console.log('Current Building Selected:', currentBuilding); // Log the current building
    }

    // Place the selected building on the grid
    function placeBuilding(cell) {
        const row = parseInt(cell.dataset.row); // Get the row index from the cell's data attribute
        const col = parseInt(cell.dataset.col); // Get the column index from the cell's data attribute

        if (currentBuilding && (roundNo === 1 || isNextToExistingBuilding(row, col))) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road'); // Remove all building classes
            cell.classList.add(currentBuilding); // Add the current building class
            updateCellIcon(cell, currentBuilding); // Update the cell with the building icon
            grid[row][col] = currentBuilding; // Update the grid state
            currentBuilding = ''; // Reset the current building selection after placement
            startNewRound(); // Start a new round
        } else if (roundNo !== 1) {
            alert('You can only build next to existing buildings.'); // Alert the user if the placement is invalid
        } else {
            alert('Select a building first.'); // Alert the user if no building is selected
        }
    }

    // Check if the cell is next to an existing building
    function isNextToExistingBuilding(row, col) {
        const directions = [
            [0, 1], // Right
            [1, 0], // Down
            [0, -1], // Left
            [-1, 0] // Up
        ];
        return directions.some(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            return newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && grid[newRow][newCol];
        });
    }
    

    // Reset the grid to its initial state
    function resetGrid() {
        const cells = document.querySelectorAll('.cell-arcade');
        cells.forEach(cell => {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road'); // Remove all building classes
            cell.innerHTML = ''; // Clear the content
        });
        grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null)); // Reset grid state
        coins = 16; // Reset coins
        roundNo = 0; // Reset round number
        startNewRound(); // Start a new round
    }

    // Attach the reset button event listener
    resetButtonArcade.addEventListener('click', () => {
        resetGrid();
    });

    // Update the cell with the appropriate building icon
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
        cell.innerHTML = ''; // Clear any existing content
        cell.appendChild(icon); // Append the new icon
    }

    // Create a lordicon element with the specified source
    function createLordicon(src) {
        const icon = document.createElement('lord-icon');
        icon.src = src;
        icon.trigger = 'hover';
        icon.style.width = '40px';
        icon.style.height = '40px';
        return icon;
    }

    startNewRound(); // Start the first round
});
