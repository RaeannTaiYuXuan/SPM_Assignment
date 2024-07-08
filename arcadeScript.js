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
    const highScoreDisplay = document.getElementById('highScoreDisplay');

    let currentBuilding = '';
    let roundNo = 0;
    let coins = 16;
    const gridSize = 20;
    let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    let demolitionMode = false;
    let gameLoaded = false;
    let loadedGameName = null;  // CHANGED HERE: Store the loaded game name

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell-arcade');
        cell.dataset.row = Math.floor(i / gridSize);
        cell.dataset.col = i % gridSize;
        cell.addEventListener('click', (event) => handleCellClick(cell, i, event));
        cityGridArcade.appendChild(cell);
    }

    function saveArcadeGame() {
        // CHANGED HERE: Check if the game was loaded
        if (loadedGameName) {
            // If the game is loaded and changes were made, save with the existing name
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
            localStorage.setItem(`arcadeGameState_${loadedGameName}`, JSON.stringify(gameState));

            // Save high score
            saveHighScore(loadedGameName, gameState.score);

            alert('Game Saved!');
        } else {
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

            // Save high score
            saveHighScore(fileName, gameState.score);

            alert('Game Saved!');
        }
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
            cells[index].className = 'cell-arcade';
        loadedGameName = sessionStorage.getItem('loadedGameName');  // CHANGED HERE: Store the loaded game name

        const cells = document.querySelectorAll('.cell-arcade');
        savedCells.forEach((savedCell, index) => {
            cells[index].className = 'cell-arcade';
            savedCell.classes.forEach(cls => cells[index].classList.add(cls));
            cells[index].innerHTML = savedCell.innerHTML;
        });

        coinsHTML.textContent = `Coins: ${coins}`;
        scoreDisplay.textContent = `Score: ${savedScore}`;
        sessionStorage.removeItem('loadedGameState');
        sessionStorage.removeItem('loadedGameName');  // CHANGED HERE: Remove the loaded game name from session storage

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
        demolitionMode = false; // Disable demolition mode when a building button is clicked
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
            updateCellIcon(cell, currentBuilding, row, col);
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

    function roadOrientation(row, col, gridSize) {
        console.log('ROAD ORIENTATION:', row, col);
        const middleValue = Math.floor(gridSize / 2) + 1;
        const horizontalValues = [];
    
        // Define corner values: row, column
        let cornerValues = {
            'topLeftCorner': [0, 0],
            'bottomLeftCorner': [gridSize - 1, 0],
            'topRightCorner': [0, gridSize - 1],
            'bottomRightCorner': [gridSize - 1, gridSize - 1]
        };
        let innerboxes = [];
        innerboxes.push(cornerValues);
    
        // Propagating all the corner values of inner boxes
        // Total no of boxes: middleValue - 1
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
        // GET HORIZONTAL VALUES
        let countHorizontal = 0;
        let startValue = 1;
        let endValue = gridSize;

        while (countHorizontal< middleValue-1){
            let colValues = [];
            for(let i = startValue; i<endValue;i++){
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
            console.log('ROW', row, col);
            for (const horizontalRow of horizontalValues) {
                for (const [key, value] of Object.entries(horizontalRow)) {
                    console.log('Key:', key, 'Value:', value);
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
                icon = createGifIcon("icons8-industrial.gif", 28, 28);
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
            img.classList.add(animationClass); // Add the animation class
        }
        img.style.width = '100%'; // Adjusting the size to fit the cell
        img.style.height = '100%'; // Adjusting the size to fit the cell
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

    function isOccupied(cell) {
        return ['residential', 'industry', 'commercial', 'park', 'road'].some(cls => cell.classList.contains(cls));
    }

    function updateScoreDisplay() {
        const score = calculateScore();
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function updateCoinsDisplay() {
        coinsHTML.textContent = `Coins: ${coins}`;
    }

    function saveHighScore(name, score) {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push({ name, score });
        highScores.sort((a, b) => b.score - a.score); // Sort by score in descending order
        if (highScores.length > 10) highScores.pop(); // Keep only top 10 scores
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }

    loadGameState();
    if (!gameLoaded) {
        startNewRound();
    }

    function openNav() {
        document.getElementById("mySidebar").style.width = "450px";
    }

    function closeNav() {
        document.getElementById("mySidebar").style.width = "0";
    }

    document.querySelector('.openbtn').addEventListener('click', openNav);
    document.querySelector('.closebtn').addEventListener('click', closeNav);
});
