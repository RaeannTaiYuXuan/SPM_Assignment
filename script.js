document.addEventListener('DOMContentLoaded', () => {
    const cityGrid = document.getElementById('cityGrid');
    const residentialButton = document.getElementById('residentialButton');
    const industryButton = document.getElementById('industryButton');
    const commercialButton = document.getElementById('commercialButton');
    const parkButton = document.getElementById('parkButton');
    const roadButton = document.getElementById('roadButton');
    const resetButton = document.getElementById('resetButton');
    const overlay = document.getElementById('overlay');
    const overlayCloseButton = document.getElementById('overlayCloseButton');
    let currentBuilding = '';

    // Create the grid
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => placeBuilding(cell));
        cityGrid.appendChild(cell);
    }

    // Event listeners for building buttons
    residentialButton.addEventListener('click', () => {
        currentBuilding = 'residential';
        showOverlay();
    });

    industryButton.addEventListener('click', () => {
        currentBuilding = 'industry';
        showOverlay();
    });

    commercialButton.addEventListener('click', () => {
        currentBuilding = 'commercial';
        showOverlay();
    });

    parkButton.addEventListener('click', () => {
        currentBuilding = 'park';
        showOverlay();
    });

    roadButton.addEventListener('click', () => {
        currentBuilding = 'road';
        showOverlay();
    });

    // Event listener for reset button
    resetButton.addEventListener('click', () => {
        resetGrid();
    });

    overlayCloseButton.addEventListener('click', () => {
        hideOverlay();
    });

    function showOverlay() {
        overlay.classList.add('show');
    }

    function hideOverlay() {
        overlay.classList.remove('show');
    }

    function placeBuilding(cell) {
        if (currentBuilding) {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road'); // Remove all building classes
            cell.classList.add(currentBuilding);
            updateCellIcon(cell, currentBuilding); // Update cell icon for the building type
            currentBuilding = ''; // Reset the current building selection after placement
            hideOverlay(); // Hide the overlay
        } else {
            alert('Select a building first.'); // When user tries to select location on grid to place building but they have not chosen which building to build yet
        }
    }

    function resetGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('residential', 'industry', 'commercial', 'park', 'road'); // Remove all building classes
            cell.innerHTML = ''; // Clear the content
        });
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