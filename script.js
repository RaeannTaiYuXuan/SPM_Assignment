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

const earningRates = {
    residential: 1,
    industry: 2,
    commercial: 3,
    park: 0,
    road: 0
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
            if (size === 15) {
                cell.classList.add('cell-arcade');
            }
            cell.dataset.index = i;
            cell.addEventListener('click', (event) => handleCellClick(cell, i, event));
            cityGrid.appendChild(cell);
        }
        cityGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        if (size === 15) {
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

    // function allBordersFilled(size) {
    //     for (let i = 0; i < size; i++) {
    //         if (!isOccupied(document.querySelector(`.cell[data-index="${i}"]`)) ||
    //             !isOccupied(document.querySelector(`.cell[data-index="${size * (size - 1) + i}"]`)) ||
    //             !isOccupied(document.querySelector(`.cell[data-index="${i * size}"]`)) ||
    //             !isOccupied(document.querySelector(`.cell[data-index="${i * size + size - 1}"]`))) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

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
            updateCellIcon(cell, currentBuilding, row, col);
    
            grid[row][col] = currentBuilding;
    
            const earning = calculateCoinEarnings(currentBuilding);
            totalProfit += earning;
            score += earning - buildingCost;
            updateDisplays();
    
            if (isBorderCell(index, gridSize)) {
                expandTo15x15();
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
        scoreDisplay.textContent = calculateScore();
        updateTurnDisplay();
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
        const gameState = sessionStorage.getItem('loadedGameState'); // CHANGED: Using sessionStorage to load game state
        if (!gameState) return;

        const { gridSize: savedGridSize, score: savedScore, turn: savedTurn, totalProfit: savedProfit, totalUpkeep: savedUpkeep, consecutiveLosingTurns: savedConsecutiveLosingTurns, previousProfit: savedPreviousProfit, grid: savedGrid, cells: savedCells } = JSON.parse(gameState);

        gridSize = savedGridSize;
        score = savedScore;
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

        updateDisplays();
        updateTurnDisplay();

        if (gridSize === 15) {
            document.body.classList.add('grid-expanded');
            document.querySelector('.toolbar').classList.add('toolbar-small');
        }
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
        score -= upkeepCost;

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

        updateDisplays();
        
        turn++;
        updateTurnDisplay();
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

    // function getRoadOrientation(row, col) {
    //     const directions = {
    //         horizontal: [[0, -1], [0, 1]],
    //         vertical: [[-1, 0], [1, 0]]
    //     };
        
    //     let isHorizontal = false;
    //     let isVertical = false;
        
    //     directions.horizontal.forEach(([dx, dy]) => {
    //         const newRow = row + dx;
    //         const newCol = col + dy;
    //         if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && grid[newRow][newCol] === 'road') {
    //             isHorizontal = true;
    //         }
    //     });
        
    //     directions.vertical.forEach(([dx, dy]) => {
    //         const newRow = row + dx;
    //         const newCol = col + dy;
    //         if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && grid[newRow][newCol] === 'road') {
    //             isVertical = true;
    //         }
    //     });
        
    //     if (isHorizontal && isVertical) {
    //         return 'both';
    //     } else if (isHorizontal) {
    //         return 'horizontal';
    //     } else if (isVertical) {
    //         return 'vertical';
    //     } else {
    //         return 'none';
    //     }
    // }

    // function updateCellIcon(cell, buildingType, row, col) {
    //     let icon;
    //     switch (buildingType) {
    //         case 'residential':
    //             icon = createLordicon("https://cdn.lordicon.com/heexevev.json");
    //             break;
    //         case 'industry':
    //             icon = createGifIcon("icons8-industrial.gif", 40, 40); // Resized to 30x30;
    //             break;
    //         case 'commercial':
    //             icon = createLordicon("https://cdn.lordicon.com/qjxbmwvd.json");
    //             break;
    //         case 'park':
    //             icon = createLordicon("https://cdn.lordicon.com/nbktuufg.json");
    //             break;
    //         case 'road':
    //             const orientation = getRoadOrientation(row, col);
    //             if (orientation === 'horizontal') {
    //                 icon = createImage("road_horizontal.png", "road-horizontal-animation");
    //             } else if (orientation === 'vertical') {
    //                 icon = createImage("road.png", "road-vertical-animation");
    //             } else {
    //                 icon = createImage("road.png", "road-default-animation");
    //             }
    //             break;
    //         default:
    //             return;
    //     }
    //     cell.innerHTML = '';
    //     cell.appendChild(icon);
    // }
    
    // function updateCellIcon(cell, buildingType, row, col) {
    //     let icon;
    //     const orientation = ifHorizontal(row,col,gridSize);
    //     console.log('ROW + COL',row,col);
    //     switch (buildingType) {
    //         case 'residential':
    //             icon = createLordicon("https://cdn.lordicon.com/heexevev.json");
    //             break;
    //         case 'industry':
    //             icon = createGifIcon("icons8-industrial.gif", 40, 40);
    //             break;
    //         case 'commercial':
    //             icon = createLordicon("https://cdn.lordicon.com/qjxbmwvd.json");
    //             break;
    //         case 'park':
    //             icon = createLordicon("https://cdn.lordicon.com/nbktuufg.json");
    //             break;
    //         case 'road':
    //             console.log('ORIENTATION:',orientation);
    //             if (orientation === 'horizontal') {
    //                 icon = createImage("road_horizontal.png", "road-horizontal-animation");
    //             } else if (row === 0 && col === 0) {
    //                 icon = createImage("road_top_left.png", "road-top-left-animation");
    //             } else if (row === gridSize - 1 && col === 0) {
    //                 icon = createImage("road_bottom_left.png", "road-bottom-left-animation");
    //             } else if (row === 0 && col === gridSize-1){
    //                 icon = createImage("road_top_right.png", "road-top-right-animation");
    //             } else if (row === gridSize-1 && row === gridSize-1){
    //                 icon = createImage("road_bottom_right.png", "road-bottom-right-animation");
    //             }
    //             else {
    //                 icon = createImage("road.png", "road-default-animation");
    //             }
    //             break;
    //     }
    
    //     cell.innerHTML = '';
    //     cell.appendChild(icon);
    // }
    
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
                console.log('ORIENTATION:', orientation);
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
                }else if (orientation === 'none'){
                    icon = createImage("road.png", "road-default-animation");
                } 
                else {
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

    function expandTo15x15() {
        const oldGrid = grid;
        const oldCells = [...document.querySelectorAll('.cell')];
        const oldSize = gridSize;
        gridSize = 15;
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
                    console.log('COMES TO EXPANSION');
                    updateCellIcon(newCells[newIndex], oldGrid[row][col],row,col);
                    grid[row + offset][col + offset] = oldGrid[row][col];
                }
            }
        }
        document.body.classList.add('grid-expanded');
        alert('Grid expanded to 15x15!');
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
        
        document.body.classList.remove('grid-expanded');
        document.querySelector('.toolbar').classList.remove('toolbar-small');
    });

    updateDisplays();
    createGrid(gridSize);
    
    // Only load game state if it was set to be loaded (from 'Load Saved Game')
    if (sessionStorage.getItem('loadedGameState')) {
        loadGameState();
    }
});
