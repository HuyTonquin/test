
const canvas = document.getElementById('battlefield');
const ctx = canvas.getContext('2d');

import { findPath } from './pathfinding.js';
import { isValidCell, manhattanDistance } from './pathfinding.js';
const dotRadius = 3;

let blocks = [];
let redDots = [];
let blueDots = [];

const redDotSpeed = 0.6;  // Adjust red dot speed
const blueDotSpeed = 1; // Adjust blue dot speed
const arrowSpeed = 5;

const gridCellSize = 10;
const gridWidth = Math.floor(canvas.width / gridCellSize);
const gridHeight = Math.floor(canvas.height / gridCellSize);
const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
// Create a Graph object for pathfinding (using js-astar library)
export { grid };


function createBlock(x, y, width, height, shape = 'rectangle') {
  return {
    x: x,
    y: y,
    width: width,
    height: height,
    shape: shape
  };
}

function drawBlock(block) {
  switch (block.shape) {
    case 'rectangle':
      ctx.fillStyle = 'black'; // Gray for rectangles
      break;
    case 'square':
      ctx.fillStyle = 'green'; // Brown for squares
      break;
    default:
      ctx.fillStyle = 'black'; // Default color if shape is not recognized
  }
  //console.log("Drawing block:", block);
  switch (block.shape) {
    case 'rectangle':
      ctx.fillRect(block.x, block.y, block.width, block.height);
      break;
    case 'square':
      ctx.fillRect(block.x, block.y, block.width, block.width);
      break;
    // You can add more shapes here (e.g., 'circle', 'triangle', etc.)
  }
}


const blockData = [
  { x: 800, y: 50, width: 15, height: 300, shape: 'rectangle' },
  { x: 655, y: 370, width: 120, height: 120, shape: 'square' },
  { x: 800, y: 600, width: 20, height: 200, shape: 'rectangle' },
];

// Create blocks from blockData
blockData.forEach(data => {
  blocks.push(createBlock(data.x, data.y, data.width, data.height, data.shape));
});

// Draw the blocks immediately
drawBlocks();





document.getElementById('numRedFormations').addEventListener('change', handleRedFormationCount);
document.getElementById('numBlueFormations').addEventListener('change', handleBlueFormationCount);
document.getElementById('startGame').addEventListener('click', startGame);

// Function to handle changes in the number of red formations
function handleRedFormationCount() {
  const numFormations = document.getElementById('numRedFormations').value;
  document.getElementById('redFormation2').style.display = (numFormations === '2') ? 'block' : 'none';
}

// Function to handle changes in the number of blue formations
function handleBlueFormationCount() {
  const numFormations = document.getElementById('numBlueFormations').value;
  document.getElementById('blueFormation2').style.display = (numFormations === '2') ? 'block' : 'none';
}


function startGame() {
  redDots = [];
  blueDots = [];

  initializeTeam('red');
  initializeTeam('blue');
  gameLoop();
}


// Create the grid and mark blocked cells
function createGrid() {
  // Initialize the grid (row-major order)
  for (let row = 0; row < gridHeight; row++) {
    grid[row] = new Array(gridWidth).fill(0); // Each inner array is a row
  }

  for (const block of blocks) {
    const blockStartCol = Math.floor(block.x / gridCellSize);
    const blockStartRow = Math.floor(block.y / gridCellSize);
    const blockEndCol = Math.floor((block.x + block.width) / gridCellSize);
    const blockEndRow = Math.floor((block.y + block.height) / gridCellSize);

    // Mark grid cells as blocked (1)
    for (let row = blockStartRow; row <= blockEndRow; row++) {
      for (let col = blockStartCol; col <= blockEndCol; col++) {
        // Boundary checks
        if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
          grid[row][col] = 1;  // Note: grid[row][col] is used now
        }
      }
    }
  }
  return grid;
}
createGrid();

function drawGrid() {
  ctx.strokeStyle = 'pink'; // Set the grid line color 
  ctx.lineWidth = 1;           // Set the grid line width

  // Draw vertical grid lines
  for (let x = 0; x < canvas.width; x += gridCellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = 0; y < canvas.height; y += gridCellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawGame() {

  redDots.forEach(drawDot);
  blueDots.forEach(drawDot);
  blocks.forEach(drawBlock);
  drawGrid();
}
function drawBlocks() {
  for (const block of blocks) {
    drawBlock(block);
  }
}
drawGame();
// Draw the blocks immediately on page load

/*function drawPath(dot) {
  if (dot.path && dot.path.length > 1) {
    ctx.beginPath();
    ctx.moveTo(
      (dot.x + 0.5) * gridCellSize, // Start at the center of the dot's current cell
      (dot.y + 0.5) * gridCellSize
    );

    for (let i = dot.pathIndex + 1; i < dot.path.length; i++) {
      const node = dot.path[i];
      ctx.lineTo(
        (node.x + 0.5) * gridCellSize, // Draw lines to the center of each path node
        (node.y + 0.5) * gridCellSize
      );
    }

    ctx.stroke();
  }
}*/

function initializeTeam(color) {
  const numFormations = parseInt(document.getElementById(`num${color.charAt(0).toUpperCase() + color.slice(1)}Formations`).value);

  for (let i = 1; i <= numFormations; i++) {
    const numDots = parseInt(document.getElementById(`num${color.charAt(0).toUpperCase() + color.slice(1)}Dots${i}`).value);
    const formation = document.getElementById(`${color}FormationType${i}`).value;
    const position = document.getElementById(`${color}Position${i}`).value;
    const isArcher = document.getElementById(`${color}Archer${i}`).checked; // Get archer status
    initializeDots(numDots, color, formation, position, isArcher); // Pass isArcher
  }
}

function initializeDots(numDots, color, formation, position, isArcher) {
  let dots = [];
  let startX, startY;

  // Calculate the number of grid cells for padding/offset 
  const paddingCells = 2; // Adjust this for more or less padding

  switch (position) {
    case 'topLeft':
      startX = paddingCells * gridCellSize;
      startY = paddingCells * gridCellSize;
      break;
    case 'topRight':
      startX = canvas.width - (paddingCells * gridCellSize) - 200;
      startY = paddingCells * gridCellSize;
      break;
    case 'bottomLeft':
      startX = paddingCells * gridCellSize;
      startY = canvas.height - (paddingCells * gridCellSize) - 200;
      break;
    case 'bottomRight':
      startX = canvas.width - (paddingCells * gridCellSize) - 200;
      startY = canvas.height - (paddingCells * gridCellSize) - 200;
      break;
    case 'center':
      startX = (canvas.width / 2) - 100;
      startY = (canvas.height / 2) - 50;
      break;
  }


  switch (formation) {
    case 'square':
      initializeSquareFormation(dots, numDots, color, startX, startY, isArcher);
      break;
    case 'rectangle':
      initializeRectangleFormation(dots, numDots, color, startX, startY, isArcher);
      break;
    case 'triangle':
      initializeTriangleFormation(dots, numDots, color, startX, startY, isArcher);
      break;
  }

  if (color === 'red') {
    redDots = redDots.concat(dots); // Add new dots to existing redDots
  } else {
    blueDots = blueDots.concat(dots); // Add new dots to existing blueDots
  }

}


function initializeSquareFormation(dots, numDots, color, startX, startY, isArcher) {
  const sideLength = Math.ceil(Math.sqrt(numDots));

  let count = 0;
  for (let i = 0; i < sideLength; i++) {
    for (let j = 0; j < sideLength; j++) {
      if (count < numDots) {
        // Calculate grid-aligned coordinates 
        let gridX = Math.floor(startX / gridCellSize) + j;
        let gridY = Math.floor(startY / gridCellSize) + i;

        let newDot = createDot(gridX, gridY, color, isArcher);

        // Ensure no overlap (grid-aware)
        let attempts = 0;
        const maxAttempts = 100;
        while (isOverlapping(newDot, dots) && attempts < maxAttempts) {
          // Randomize grid coordinates within the formation's area
          newDot.x = Math.floor(startX / gridCellSize) + Math.floor(Math.random() * sideLength);
          newDot.y = Math.floor(startY / gridCellSize) + Math.floor(Math.random() * sideLength);
          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.warn("Max attempts reached for dot placement. Possible overlap.");
        }

        dots.push(newDot);
        count++;
      }
    }
  }
}

function initializeRectangleFormation(dots, numDots, color, startX, startY, isArcher) {
  const rows = Math.ceil(numDots / 3);
  const cols = 3;

  let count = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (count < numDots) {
        // Calculate grid-aligned coordinates
        let gridX = Math.floor(startX / gridCellSize) + j;
        let gridY = Math.floor(startY / gridCellSize) + i;

        let newDot = createDot(gridX, gridY, color, isArcher); // Use grid coordinates

        // Ensure no overlap (grid-aware)
        let attempts = 0;
        const maxAttempts = 100;
        while (isOverlapping(newDot, dots) && attempts < maxAttempts) {
          // Randomize grid coordinates within the formation's area
          newDot.x = Math.floor(startX / gridCellSize) + Math.floor(Math.random() * cols);
          newDot.y = Math.floor(startY / gridCellSize) + Math.floor(Math.random() * rows);
          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.warn("Max attempts reached for dot placement. Possible overlap.");
        }

        dots.push(newDot);
        count++;
      }
    }
  }
}

function initializeTriangleFormation(dots, numDots, color, startX, startY, isArcher) {
  let rows = 1;
  let count = 0;

  // Calculate the maximum base width that fits in half the canvas, aligned to the grid
  const maxGridWidth = Math.floor((canvas.width / 2) / gridCellSize) - 2;

  while (count < numDots) {
    let rowGridWidth = rows;

    if (rowGridWidth > maxGridWidth) {
      rowGridWidth = maxGridWidth;
    }

    let gridX = Math.floor(startX / gridCellSize) - Math.floor(rowGridWidth / 2);

    for (let i = 0; i < rowGridWidth && count < numDots; i++) {
      let currentGridX = gridX + i;
      let gridY = Math.floor(startY / gridCellSize) + rows - 1;

      let newDot = createDot(currentGridX, gridY, color, isArcher); // Create using grid coordinates

      // Ensure no overlap (grid-aware)
      let attempts = 0;
      const maxAttempts = 100;
      while (isOverlapping(newDot, dots) && attempts < maxAttempts) {
        // Randomize within the row bounds (grid coordinates)
        currentGridX = gridX + Math.floor(Math.random() * rowGridWidth);
        newDot.x = currentGridX; // Update gridX directly
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.warn("Max attempts reached for dot placement. Possible overlap in triangle.");
      }

      dots.push(newDot);
      count++;
    }

    rows++;
  }
}



// Function to create a dot object
function createDot(x, y, color, isArcher) {
  // Calculate angle towards the opposing side's center (using grid coordinates)
  const targetX = (color === 'red') ? gridWidth : 0; // Target grid column
  const targetY = gridHeight / 2; // Target grid row
  const angle = Math.atan2(targetY - y, targetX - x);
  // Set speed based on color
  const speed = (color === 'red') ? redDotSpeed : blueDotSpeed;

  // Set attack and defense values (adjust as needed)
  const attack = (color === 'red') ? 10 : 7; // Example: Red dots have higher attack
  const defense = (color === 'red') ? 10 : 9; // Example: Blue dots have higher defense
  const maxHealth = (color === 'red') ? 20 : 16;
  const attackCooldown = 500; // Cooldown in milliseconds (0.5 seconds)
  return {
    x: x, // Convert pixel x to grid x
    y: y, // Convert pixel y to grid y
    color: color,
    target: null,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    speed: speed,
    attack: attack, // Add attack property
    defense: defense, // Add defense property
    radius: dotRadius,
    path: null,
    pathIndex: 0,
    maxHealth: maxHealth,
    currentHealth: maxHealth,
    attackCooldown: attackCooldown,
    isArcher: isArcher,  // Set the isArcher property
    arrows: [],
    arrowRange: 150, // Set the arrow range (adjust this value as needed)    
    lastAttackTime: 0
  };

}

// Function to draw a dot (same as before)
function drawDot(dot) {
  ctx.beginPath();
  // Calculate center coordinates of the dot in pixels

  ctx.arc(Math.floor((dot.x - 0.5) / gridCellSize), Math.floor(dot.y - 0.5)/ gridCellSize, dotRadius, 0, Math.PI * 2);

  // Set fill style based on health
  const healthRatio = dot.currentHealth / dot.maxHealth;
  if (healthRatio > 0.8) {
    ctx.fillStyle = dot.color; // Full health color
  } else if (healthRatio > 0.5) {
    ctx.fillStyle = 'orange';  // Medium health color
  } else if (healthRatio > 0.3) {
    ctx.fillStyle = 'yellow';  // Medium health color
  } else {
    ctx.fillStyle = 'black';     // Low health color
  }
  ctx.fill();
  console.log("Dot drawn:", dot); // Log the dot after drawing

}


// ...


// Function to update arrow positions and remove off-screen arrows
function updateArrows(dot) {
  for (let i = dot.arrows.length - 1; i >= 0; i--) {
    const arrow = dot.arrows[i];

    // Update arrow position
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;

    // Calculate distance traveled by the arrow (using the corrected function)
    const distanceTraveled = getDistanceTraveled(arrow, dot.x, dot.y);

    // Remove arrow if it goes off-screen OR travels more than 200 pixels
    if (
      arrow.x < 0 ||
      arrow.x > canvas.width ||
      arrow.y < 0 ||
      arrow.y > canvas.height ||
      distanceTraveled > 200
    ) {
      dot.arrows.splice(i, 1);
    }
  }
}

function getDistanceTraveled(arrow, originX, originY) {
  const dx = arrow.x - originX;
  const dy = arrow.y - originY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}


function updateDot(dot) {
  console.log("Target at the beginning of updateDot:", dot.target);
  if (dot.target) {
    const start = { row: dot.y, col: (dot.x) };
    const end = { row: (dot.target.y), col: (dot.target.x) };
    const currentGridX = Math.floor(dot.x);
    const currentGridY = Math.floor(dot.y);
    dot.path = findPath(start, end);
    console.log("start end", start, end);
    if (!dot.pathTarget) {
      dot.pathTarget = { col: 0, row: 0 }; // Or some default values
    }
    // 1. Same-Color Dot Avoidance 
    const dotsArray = (dot.color === 'red') ? redDots : blueDots;
    for (const otherDot of dotsArray) {
      if (
        otherDot !== dot &&
        checkCollision({ col: currentGridX, row: currentGridY }, otherDot)
      ) {
        const avoidancePath = findAvoidancePath(dot, otherDot);

        if (avoidancePath && avoidancePath.length > 1) {
          const nextNode = avoidancePath[1];
          moveDotTowards(dot, nextNode.col, nextNode.row);
          break;
        }
      }
    }

    // 2. Pathfinding to Target 
    if (
      !dot.path ||
      !dot.pathTarget ||
      dot.pathTarget.x !== dot.target.y ||
      dot.pathTarget.x !== dot.target.y
    ) {
      dot.path = findPath(start, end);
      dot.pathTarget = { col: dot.target.x, row: dot.target.y }; // Store target grid cell
      dot.pathIndex = 1; // Start from the second node (index 1)
      console.log("path target", dot.path);
    }


    if (dot.path && dot.path.length > 1 && dot.pathIndex < dot.path.length) {
      const nextNode = dot.path[dot.pathIndex];
      console.log("Path:", dot.path);
      console.log("Path Index:", dot.pathIndex);
      console.log("Next Node:", nextNode);
      moveDotTowards(dot, nextNode.col * gridCellSize, nextNode.row * gridCellSize); // Convert grid to pixel

      // Check if reached the center of the next grid cell
      if (
        Math.abs((nextNode.col + 0.5) * gridCellSize - dot.x) < dot.speed &&
        Math.abs((nextNode.row + 0.5) * gridCellSize - dot.y) < dot.speed
      ) {
        dot.pathIndex++;

        // If dot has reached the end of the path
        if (dot.pathIndex === dot.path.length) {
          // Handle end of path (e.g., set dot.target to null or find a new target)
          dot.target = null; // Example: Clear the target
        }
      }
    }


    if (dot.isArcher) {
      // Calculate grid-based direction to target
      const gridDX = dot.target.x - dot.x;
      const gridDY = dot.target.y - dot.y;
      let targetAngle = Math.atan2(gridDY, gridDX); // Angle on the grid

      // Calculate pixel-based movement for smooth animation
      dot.x += dot.speed * dot.vx / gridCellSize; // Move on the grid
      dot.y += dot.speed * dot.vy / gridCellSize;

      const currentTime = Date.now();
      if (currentTime - dot.lastAttackTime >= 500) {
        // Calculate distance to target on the grid 
        const gridDistanceToTarget = Math.sqrt(gridDX * gridDX + gridDY * gridDY);

        if (gridDistanceToTarget * gridCellSize <= dot.arrowRange) { // Compare in pixels
          // Create arrow using the pixel coordinates of the dot
          dot.arrows.push(createArrow(dot.x * gridCellSize, dot.y * gridCellSize, targetAngle, dot.color));
          dot.lastAttackTime = currentTime;
        }
      }
    }

    // ... (Archer logic - should also be adapted for grid-based movement) ...
  }
  updateArrows(dot);
  console.log("Dot After:", dot.x, dot.y)
  console.log("Dot updated:", dot);
}


// Helper function to move a dot towards a target grid cell
function moveDotTowards(dot, targetX, targetY) {
  console.log("Dot Before:", dot.x, dot.y); // Dot position before update
  // Calculate the pixel difference between the dot and the target
  const dx = targetX - dot.x;
  const dy = targetY - dot.y;

  // Calculate the angle towards the target

  const angle = Math.atan2(dy, dx);

  // Calculate the movement vector components
  dot.vx = Math.cos(angle);
  dot.vy = Math.sin(angle);

  // Update the dot's position (in pixel coordinates)
  dot.x += dot.speed * dot.vx;
  dot.y += dot.speed * dot.vy;
  ; // Dot position after update
}
// Function to find a short path to avoid another dot
function findAvoidancePath(dot, obstacleDot) {
  // Get the dot's current grid cell coordinates
  const currentGridCol = Math.floor(dot.x);
  const currentGridRow = Math.floor(dot.y);

  const potentialPositions = [
    { col: currentGridCol + 1, row: currentGridRow }, // Right
    { col: currentGridCol - 1, row: currentGridRow }, // Left
    { col: currentGridCol, row: currentGridRow + 1 }, // Down
    { col: currentGridCol, row: currentGridRow - 1 }, // Up
  ];

  let bestPosition = null;
  let furthestDistance = -Infinity;

  for (const pos of potentialPositions) {
    // Check for valid grid position and no collision
    if (isValidCell(pos.col, pos.row) && !checkCollision(pos, obstacleDot)) {
      // Temporarily modify isValidCell within findPath
      const originalIsValidCell = isValidCell;
      isValidCell = (col, row) => {
        if (obstacleDot.path.some(node => node.col === col && node.row === row)) return false;
        return originalIsValidCell(col, row); // Use col and row here, not x and y
      };

      const pathToTarget = findPath(pos, { col: Math.floor(dot.target.x), row: Math.floor(dot.target.y) });
      // Restore original isValidCell
      isValidCell = originalIsValidCell;

      if (pathToTarget) {
        const distance = getDistance(
          { x: pos.col * gridCellSize, y: pos.row * gridCellSize }, // Convert to pixel for getDistance
          { x: obstacleDot.x, y: obstacleDot.y }
        );

        if (distance > furthestDistance) {
          furthestDistance = distance;
          bestPosition = pos;
        }

      }
    }
  }

  if (bestPosition) {
    return [
      { col: currentGridCol, row: currentGridRow }, // Current position (grid)
      { col: bestPosition.x, row: bestPosition.y } // Correct property names
    ];
  }
  console.log("best position", pathToTarget);
  return null; // No immediate avoidance path found
}

function drawPath(dot) {
  if (dot.path && dot.path.length > 1) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Set path color and transparency
    ctx.lineWidth = 2; // Set path line width

    ctx.beginPath();
    ctx.moveTo(dot.x + dotRadius, dot.y + dotRadius); // Start at dot's center

    for (let i = dot.pathIndex; i < dot.path.length; i++) {
      const node = dot.path[i];
      ctx.lineTo(
        (node.col + 0.5) * gridCellSize, // Draw lines to the center of each path node
        (node.row + 0.5) * gridCellSize
      );
    }

    ctx.stroke();
  }
}


// ... (Archer logic - same as before)

// Update position with adjusted speeds
// Check for overlap with dots of the SAME color

// Calculate velocity components based on the adjusted targetAngle

// Function to create an arrow object
function createArrow(x, y, angle, color) {
  return {
    x: x,
    y: y,
    vx: Math.cos(angle) * arrowSpeed,
    vy: Math.sin(angle) * arrowSpeed,
    color: color,
    radius: 1.5
  };
}
// Bounce off edges (optional)
// ... (You can keep or remove the bouncing logic)

// Function to check for collisions same color (same as before)

/*
function checkCollisionWithBlock(dot, block) {
  // Find the closest point on the block's perimeter to the dot's center
  const closestPoint = findClosestPointOnBlock(dot, block);

  // Calculate the distance between the dot's center and the closest point
  const dx = dot.x - closestPoint.x;
  const dy = dot.y - closestPoint.y;
  const distanceSquared = dx * dx + dy * dy;

  // Collision occurs if the distance is less than the dot's radius squared
  return distanceSquared < 36;
}
*/



/*function findClosestPointOnBlock(dot, block) {
  // Find the closest point on the block's edges to the dot
  let closestX = clamp(dot.x, block.x - 100, block.x + block.width);
  let closestY = clamp(dot.y, block.y, block.y + block.height);

  // Additional checks for left and top edges
  if (dot.x + 100 < block.x) {
    closestX = block.x - 100; // Closest point is on the left edge
  } else if (dot.x - 10 >= block.x + block.width)
    closestX = block.x + block.width + 10;
  if (dot.y < block.y) {
    closestY = block.y; // Closest point is on the top edge
  } else if (dot.y >= block.y + block.height) {
    closestY = block.y + block.height;
  }
  return { x: closestX, y: closestY };
}

// Helper function to clamp a value within a range (same as before)
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
*/

function checkCollision(dot1, dot2) {
  // Check if the dots occupy the same grid cell
  return (dot1.x === dot2.x && dot1.y === dot2.y);
}

/*function checkCollision(dot1, dot2) {
  // Calculate the distance between the centers of the objects 
  const dx = dot2.x - dot1.x;
  const dy = dot2.y - dot1.y;
 
  // Calculate the sum of the radii
  const sumRadii = dot1.radius + dot2.radius;
 
  // Check if the distance is less than the sum of the radii
  return Math.abs(dx) < sumRadii && Math.abs(dy) < sumRadii; 
}
*/

function checkCollision_opposite1(dot1, dot2) {
  const collisionDistanceSquared = 1; // 1 grid cell distance
  const dot1GridCol = Math.floor(dot1.x / gridCellSize);
  const dot1GridRow = Math.floor(dot1.y / gridCellSize);
  const dot2GridCol = Math.floor(dot2.x / gridCellSize);
  const dot2GridRow = Math.floor(dot2.y / gridCellSize);
  const dcol = dot2GridCol - dot1GridCol;
  const drow = dot2GridRow - dot1GridRow;
  const distanceSquared = dcol * dcol + drow * drow;

  return distanceSquared < collisionDistanceSquared;
}

function checkCollisionArrowDot(arrow, dot) {
  const dx = dot.x - arrow.x;
  const dy = dot.y - arrow.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiiSumSquared = (arrow.radius + dot.radius) ** 2;
  return distanceSquared < radiiSumSquared;
}

function resolveCollisions() {

  // 1. Check collisions for red dots

  for (let i = 0; i < redDots.length; i++) {
    for (let j = 0; j < blueDots.length; j++) {
      if (checkCollision_opposite1(redDots[i], blueDots[j])) {
        // Example damage calculation (adjust as needed):
        const currentTime = Date.now();
        if (currentTime - redDots[i].lastAttackTime >= redDots[i].attackCooldown) {
          // Red dot attacks blue dot
          let damageToBlue = calculateDamage(redDots[i].attack, blueDots[j].defense);

          blueDots[j].currentHealth -= damageToBlue;
          redDots[i].lastAttackTime = currentTime; // Update last attack time
        }
        if (blueDots[j].currentHealth <= 0) {
          blueDots.splice(j, 1);
          break;// Exit the inner loop as this red dot is gone
        }
      }
    }
  }
  for (const redDot of redDots) {
    for (let i = redDot.arrows.length - 1; i >= 0; i--) {
      for (let j = blueDots.length - 1; j >= 0; j--) {
        if (checkCollisionArrowDot(redDot.arrows[i], blueDots[j])) {
          // Red arrow hit a blue dot!
          let damageToBlue = calculateDamage(redDot.attack, blueDots[j].defense);
          blueDots[j].currentHealth -= damageToBlue;
          redDot.arrows.splice(i, 1); // Remove the arrow

          if (blueDots[j].currentHealth <= 0) {
            blueDots.splice(j, 1);
          }
          break; // No need to check collisions with other blue dots 
        }
      }
    }
  }
  // 2. Check collisions for blue dots 
  for (let i = redDots.length - 1; i >= 0; i--) {
    for (let j = blueDots.length - 1; j >= 0; j--) {
      if (checkCollision_opposite1(redDots[i], blueDots[j])) {
        // Example damage calculation (adjust as needed):
        const currentTime = Date.now();
        if (currentTime - blueDots[j].lastAttackTime >= 0.5 * blueDots[j].attackCooldown) {
          // Blue dot attacks red dot
          let damageToRed = calculateDamage(blueDots[j].attack, redDots[i].defense);
          redDots[i].currentHealth -= damageToRed;
          blueDots[j].lastAttackTime = currentTime; // Update last attack time
        }
        if (redDots[i].currentHealth <= 0) {
          redDots.splice(i, 1);
          break;
        }
      }
    }
  }
  for (const blueDot of blueDots) {
    for (let i = blueDot.arrows.length - 1; i >= 0; i--) {
      for (let j = redDots.length - 1; j >= 0; j--) {
        if (checkCollisionArrowDot(blueDot.arrows[i], redDots[j])) {
          let damageToRed = calculateDamage(blueDot.attack * 0.8, redDots[j].defense);
          redDots[j].currentHealth -= damageToRed;
          blueDot.arrows.splice(i, 1);

          if (redDots[j].currentHealth <= 0) {
            redDots.splice(j, 1);
          }
          break;
        }
      }
    }
  }
}


function assignTargets() {
  // Assign targets for red dots
  for (const redDot of redDots) {
    let closestBlueDot = null;
    let closestDistance = Infinity;

    for (const blueDot of blueDots) {
      const distance = manhattanDistance(
        { col: Math.floor(redDot.x), row: Math.floor(redDot.y) },
        { col: Math.floor(blueDot.x), row: Math.floor(blueDot.y) }
      );

      // Pre-filter targets by range (especially for archers)
      if (!redDot.isArcher || distance * gridCellSize <= redDot.arrowRange) {
        const path = findPath(
          { col: Math.floor(redDot.x), row: Math.floor(redDot.y) },
          { col: Math.floor(blueDot.x), row: Math.floor(blueDot.y) }
        );

        if (path && path.length > 0 && distance < closestDistance) {
          closestDistance = distance;
          closestBlueDot = blueDot;
        }
      }
    }

    redDot.target = closestBlueDot;
  }

  // Assign targets for blue dots (similar logic)
  for (const blueDot of blueDots) {
    let closestRedDot = null;
    let closestDistance = Infinity;

    for (const redDot of redDots) {
      const distance = manhattanDistance(
        { col: Math.floor(blueDot.x), row: Math.floor(blueDot.y) },
        { col: Math.floor(redDot.x), row: Math.floor(redDot.y) }
      );

      // Pre-filter targets by range (especially for archers)
      if (!blueDot.isArcher || distance * gridCellSize <= blueDot.arrowRange) {
        const path = findPath(
          { col: Math.floor(blueDot.x), row: Math.floor(blueDot.y) },
          { col: Math.floor(redDot.x), row: Math.floor(redDot.y) }
        );
        //console.log("Blue Dot", blueDot, "Shortest Path to Target", blueDot.target, ":", path);
        if (path && path.length > 0 && distance < closestDistance) {
          closestDistance = distance;
          closestRedDot = redDot;
          console.log("Blue Dot Target:", closestRedDot);
          console.log("Blue Dot Path:", path);
        }
      }
    }

    blueDot.target = closestRedDot;
  }

}
// Assign targets for blue dots (similar logic - adapt as needed)
// ... (Implementation for blue dots) ...

// Helper function to check if a target is still valid

function isOverlapping(newDot, dotsArray) {
  for (const dot of dotsArray) {
    if (checkCollision(newDot, dot)) {
      return true;
    }
  }
  return false;
}



function calculateDamage(attack, defense) {
  let baseDamage = attack - defense / 2;
  let randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
  let damage = Math.max(1, baseDamage * randomFactor); // Ensure minimum damage of 1
  return Math.round(damage); // Round to the nearest integer
}

// Game loop 
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Assign new targets each frame
  assignTargets();
  // Update and draw ALL dots in a single loop
  redDots.forEach(updateDot);
  redDots.forEach(drawDot);
  blueDots.forEach(updateDot);
  blueDots.forEach(drawDot);

  //resolveCollisions(); // Handle collisions
  // Draw other game elements

  // Draw arrows for ALL dots
  for (const dot of redDots.concat(blueDots)) {
    for (const arrow of dot.arrows) {
      ctx.beginPath();
      ctx.arc(arrow.x, arrow.y, arrow.radius, 0, Math.PI * 2);
      ctx.fillStyle = arrow.color;
      ctx.fill();
    }
  }
  console.log("Red Dots:", redDots);
  console.log("Blue Dots:", blueDots);
  // Check for a winner
  if (redDots.length === 0) {
    alert("Blue Wins!");
    return;
  } else if (blueDots.length === 0) {
    alert("Red Wins!");
    return;
  }

  requestAnimationFrame(gameLoop);
} 