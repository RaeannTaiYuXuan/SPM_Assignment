document.addEventListener('DOMContentLoaded', () => {
    const cityGrid = document.getElementById('cityGrid');
    const houseButton = document.getElementById('houseButton');
    const roadButton = document.getElementById('roadButton');
    const cafeButton = document.getElementById('cafeButton');
    const tallBuildingButton = document.getElementById('tallBuildingButton');
    const resetButton = document.getElementById('resetButton');
    let currentBuilding = '';

    // Create the grid
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => placeBuilding(cell));
        cityGrid.appendChild(cell);
    }

    // Event listener for house button
    houseButton.addEventListener('click', () => {
        currentBuilding = 'house';
    });

    // Event listener for road button
    roadButton.addEventListener('click', () => {
        currentBuilding = 'road';
    });

    // Event listener for cafe button
    cafeButton.addEventListener('click', () => {
        currentBuilding = 'cafe';
    });

    // Event listener for tall building button
    tallBuildingButton.addEventListener('click', () => {
        currentBuilding = 'tall-building';
    });

    // Event listener for reset button
    resetButton.addEventListener('click', () => {
        resetGrid();
    });

    function placeBuilding(cell) {
        if (currentBuilding) {
            cell.classList.remove('house', 'road', 'cafe', 'tall-building'); // Remove all building classes
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding); // Update cell icon for the building type
        }
    }

    function resetGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('house', 'road', 'cafe', 'tall-building'); // Remove all building classes
            cell.innerHTML = ''; // Clear the content
        });
    }

    function updateCellIcon(cell, buildingType) {
        let icon;
        switch (buildingType) {
            case 'house':
                icon = createLordicon("https://cdn.lordicon.com/heexevev.json");
                break;
            case 'road':
                icon = createLordicon("https://cdn.lordicon.com/zneicxkd.json");
                break;
            case 'cafe':
                icon = createLordicon("https://cdn.lordicon.com/qjxbmwvd.json");
                break;
            case 'tall-building':
                icon = createLordicon("https://cdn.lordicon.com/gfseemfv.json");
                break;
            default:
                return;
        }
        cell.innerHTML = ''; // Clear any existing content
        cell.appendChild(icon); // Append the new icon
    }

    function createLordicon(src) {
        const icon = document.createElement('lord-icon');
        icon.src = src;
        icon.trigger = 'hover';
        icon.style.width = '40px';
        icon.style.height = '40px';
        return icon;
    }
});
