// pathfinder.js

import { grid } from './GAME3.JS';

export function manhattanDistance(a, b) {
  /*console.log("a:", a);
console.log("b:", b);
console.log("a.row:", a.row, "a.col:", a.col, "b.row:", b.row, "b.col:", b.col); */
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function findPath(start, end) {
  const openSet = [];
  const closedSet = [];

  start.g = 0;
  start.h = manhattanDistance(start, end);
  start.f = start.g + start.h;
  openSet.push(start);

  while (openSet.length > 0) {
    // 1. Find the node with the lowest f cost in the open set
    let currentNode = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (
        openSet[i].f < currentNode.f ||
        (openSet[i].f === currentNode.f && openSet[i].h < currentNode.h)
      ) {
        currentNode = openSet[i];
      }
    }

    // 2. Remove the current node from the open set and add it to the closed set
    openSet.splice(openSet.indexOf(currentNode), 1);
    closedSet.push(currentNode);

    // 3. If the current node is the goal, reconstruct the path
    if (currentNode.row === end.row && currentNode.col === end.col) {
      const path = [];
      let temp = currentNode;
      while (temp) {
        path.push(temp);
        temp = temp.parent;
      }
      return path.reverse(); 
    }

    // 4. Generate neighbors
    const directions = [
      [0, 1],   // Right
      [1, 0],   // Down
      [0, -1],  // Left
      [-1, 0],  // Up
      [1, 1],   // Down-Right (Diagonal)
      [-1, 1],  // Down-Left (Diagonal)
      [1, -1],  // Up-Right (Diagonal)
      [-1, -1]  // Up-Left (Diagonal)
    ]; 

    for (let dir of directions) {
      const neighborRow = currentNode.row + dir[0];
      const neighborCol = currentNode.col + dir[1];

      // 5. Check if the neighbor is valid
      if (isValidCell(neighborCol, neighborRow)) {
        const neighbor = {
          row: neighborRow,
          col: neighborCol,
          parent: currentNode,
        };

        // 6. Calculate costs
        neighbor.g = currentNode.g + 1; // Assuming a cost of 1 per movement
        neighbor.h = manhattanDistance(neighbor, end); 
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.g = currentNode.g + (dir[0] !== 0 && dir[1] !== 0 ? 1.414 : 1); 
        // 7. Skip if neighbor is in the closed set
        if (closedSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
          continue;
        }

        // 8. Check if neighbor is already in the open set with a lower g cost
        const openSetNode = openSet.find(node => node.row === neighbor.row && node.col === neighbor.col);

        if (!openSetNode || neighbor.g < openSetNode.g) {
          // Update the neighbor in the open set or add it if it's new
          if (openSetNode) {
            openSetNode.g = neighbor.g;
            openSetNode.f = neighbor.f;
            openSetNode.parent = currentNode;
          } else {
            openSet.push(neighbor);
          }
        }
      }
    }
  } // No path found
  return null;
}

// Helper function to check if a cell is valid and not an obstacle
export function isValidCell(col, row, pathToAvoid = null) { // Swapped parameters here
  // Check if the cell is within the grid bounds
  if (col < 0 || col >= grid[0].length || row < 0 || row >= grid.length) {
    return true;
  }

  // Check if the cell is occupied by another dot or is on the path to avoid
  // ... (Your existing logic to check for collisions with other dots) ...

  // Check if cell is on the path to avoid
  if (pathToAvoid) {
    for (const node of pathToAvoid) {
      if (node.col === col && node.row === row) { // Changed x and y to col and row
        return false; // Cell is on the path to avoid
      }
    }
  }

  return true; // Cell is valid
}