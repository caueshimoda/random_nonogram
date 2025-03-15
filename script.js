/**
 * Updates an element's attributes, handling nested attributes.
 *
 * @param {HTMLElement} element - The HTML element to modify.
 * @param {object} attributes - An object containing attributes and their values.
 */
function changeElement(element, attributes) {
  // Check if the element is null; if so, log an error and return.
  if (element === null) {
    console.log('Null element');
    return;
  }

  // Iterate through the attributes object.
  for (const attribute in attributes) {
    const value = attributes[attribute];

    // Check if the attribute's value is an object (nested attributes).
    if (typeof value === 'object' && value !== null) {
      // If it's an object, iterate through its sub-attributes.
      for (const subAttribute in value) {
        // Recursively call changeElement to update the nested attribute.
        changeElement(element[attribute], { [subAttribute]: value[subAttribute] });
      }
    } else {
      // If it's not an object, directly set the attribute's value.
      element[attribute] = value;
    }
  }
}

/**
 * Removes all elements with a specified class from the DOM.
 *
 * @param {string} divClass - The class name of the elements to remove.
 */
function deleteElementByClass(divClass) {
  // Select all elements with the specified class.
  const elementGroup = document.querySelectorAll(`.${divClass}`);

  // Iterate through the selected elements and remove each one.
  for (const element of elementGroup) {
    element.remove();
  }
}

/**
 * Class representing a Nonogram game.
 */
class Nonogram {
  /**
   * Creates a Nonogram game instance.
   *
   * @param {number} [rows=8] - Number of rows in the grid.
   * @param {number} [cols=8] - Number of columns in the grid.
   * @param {number} [sqEasy=40] - Number of filled squares for easy difficulty.
   * @param {number} [sqMedium=32] - Number of filled squares for medium difficulty.
   * @param {number} [sqHard=24] - Number of filled squares for hard difficulty.
   * @param {number} [revEasy=0] - Number of reveals for easy difficulty.
   * @param {number} [revMedium=1] - Number of reveals for medium difficulty.
   * @param {number} [revHard=3] - Number of reveals for hard difficulty.
   */
  constructor(rows = 8, cols = 8, sqEasy = 40, sqMedium = 32, sqHard = 24, revEasy = 0, revMedium = 1, revHard = 3) {
    this.end = false; // Flag to indicate if the game is over.
    this.squaresLeft = 0; // Number of squares left to be filled.
    this.rows = rows; // Number of rows.
    this.cols = cols; // Number of columns.
    this.squares = []; // 2D array representing the game grid.
    this.rowsNumbers = []; // Array to store row number hints.
    this.colsNumbers = []; // Array to store column number hints.
    this.revealTable = { Easy: revEasy, Medium: revMedium, Hard: revHard }; // Object mapping difficulty to reveal counts.
    this.reveals = 0; // Number of reveals
    this.revealed = []; // Squares revealed.
    this.isRevealing = false; // Flag to indicate if the game is in reveal square state.
    this.filledSquares = { Easy: sqEasy, Medium: sqMedium, Hard: sqHard }; // Object mapping difficulty to filled square counts.
    this.squareAttributes = { // Object mapping square states to their visual attributes.
      0: { style: { background: 'white' }, textContent: '' },
      1: { style: { background: 'var(--square-filled-bg)' } },
      2: { style: { background: 'white' }, textContent: 'X' }
    };
    this.handleClick = this.handleClick.bind(this); // Bind handleClick to the class instance.
    this.resetPage = this.resetPage.bind(this); // Bind resetPage to the class instance.
  }

  /**
   * Initializes the Nonogram game based on the selected difficulty.
   *
   * @param {string} difficulty - The difficulty level ('Easy', 'Medium', 'Hard').
   */
  initializeNonogram(difficulty) {
    let filledSquaresLeft = this.filledSquares[difficulty]; // Get the number of filled squares for the difficulty.
    const squaresToFill = []; // Array to store the indices of squares to be filled.
    this.reveals = this.revealTable[difficulty]; // Set the number of reveals for the difficulty.
    const revealElement = document.getElementById('reveal'); // Get the reveal count element.
    revealElement.innerHTML = `Reveal Square<br>${this.reveals} Left`; // Update the reveal count display.
    const difficultyElement = document.getElementById('difficulty'); // Get the difficulty display element.
    difficultyElement.innerText = difficulty; // Update the difficulty display.
    this.squaresLeft = filledSquaresLeft; // Sets the number of squares for the player to fill.
    this.revealed = []; // Resets the revealed array.

    // Randomly select squares to fill.
    while (filledSquaresLeft) {
      let randomSquare = Math.floor(Math.random() * this.rows * this.cols);
      if (!squaresToFill.includes(randomSquare)) {
        squaresToFill.push(randomSquare);
        filledSquaresLeft -= 1;
      }
    }

    // Initialize the game grid and assign answers (1 if the square is on the list to be filled, 0 otherwise)
    for (let row = 0; row < this.rows; row++) {
      const rowSquares = [];
      for (let col = 0; col < this.cols; col++) {
        let answer = squaresToFill.includes(this.cols * row + col) ? 1 : 0;
        rowSquares.push({ state: 0, answer: answer });
        // Reset square visual state if the game has ended.
        if (this.end) {
          const sqElement = document.getElementById(`square_${row}_${col}`);
          changeElement(sqElement, this.squareAttributes[0]);
        }
      }
      this.squares.push(rowSquares);
    }
  }

  /**
   * Checks if a square's state is correct.
   *
   * @param {object} square - The square object.
   * @returns {boolean} - True: state and answer are the same (1 and 1, 0 and 0),
   or state is 2 and answer is 0 (both are not 1, meaning not 'filled'). Otherwise: false.
   */
  isCorrectState(square) {
    return square.state % 2 === square.answer % 2;
  }

    /**
   * Checks if all the elements of a given axis are correct (rows or columns).
   *
   * @param {string} axis - The axis ('rows' or 'cols').
   */
  isAxisCorrect(axis) {
    let row, col, subAxis; 
    const axisToCheck = `${axis}Numbers`; // Construct the property name for the axis numbers.
    subAxis = axis === 'rows'? 'cols': 'rows'; // Determine the sub-axis.

    for (let axis1 = 0; axis1 < this[axis]; axis1++) { // Iterate through each row or column.
      let number = 0, currentAxisIndex = this[axisToCheck][axis1].length - 1; // Initialize number count and index for number hints.
      
      if (axis === 'rows') {
        row = axis1;
      } else {
        col = axis1;
      }

      for (let axis2 = 0; axis2 < this[subAxis]; axis2++) { // Iterate through each cell in the row or column.
        if (axis === 'rows') {
          col = axis2;
        } else {
          row = axis2;
        }
        if (this.squares[row][col].state === 1) { // If the square is filled.
          if (currentAxisIndex < 0) { // If we've run out of number hints, it's incorrect.
            return false;
          }
          number += 1; // Increment the count of consecutive filled squares.
        } else if (number) { // If we encounter an empty square after a sequence of filled squares.
          if (number !== this[axisToCheck][axis1][currentAxisIndex]) { // Check if the count matches the current hint.
            return false;
          } 
          number = 0; // Reset the count.
          currentAxisIndex--; // Move to the next number hint.
        }
      }
      
      if (currentAxisIndex > 0) { // If there are remaining number hints, it's incorrect.
        return false;
      }
      
      if (currentAxisIndex === 0 && number !== this[axisToCheck][axis1][currentAxisIndex]) { // Check the last number hint.
        return false;
      }
    }
    return true; // All hints match, the axis is correct.
  }

  /**
   * Checks if the entire grid is correct (game over condition).
   *
   * @returns {boolean} - True if the game is over, false otherwise.
   */
  isGameOver() {
    if (!this.isAxisCorrect('rows')) {
      return false;
    } 
    if (!this.isAxisCorrect('cols')) {
      return false;
    } 
    this.end = true;
    return true;
  }

  /**
   * Updates the state and visual representation of a square.
   *
   * @param {string} squareId - The ID of the square element.
   * @param {object} square - The square object.
   */
  updateSquare(squareId, square) {
    const element = document.getElementById(squareId);
    square.state = square.state <  2? square.state + 1: 0;  // Cycle through square states (0, 1, 2).

    if (square.state === 1) {
      this.squaresLeft -= 1; // Decrement remaining squares if filled.
    } else if (square.state === 2) {
      this.squaresLeft += 1; // Increment remaining squares if marked with 'X'.
    }
  
    changeElement(element, this.squareAttributes[square.state]); // Update the square's visual appearance.
  }

  /**
   * Determines the number hints for a given axis (rows or columns).
   *
   * @param {string} axis - The axis ('rows' or 'cols').
   */
  determineAxisNumbers(axis) {
    let row, col, subAxis;
    const axisToUpdate = `${axis}Numbers`; // Construct the property name for the axis numbers.
    subAxis = axis === 'rows'? 'cols': 'rows'; // Determine the sub-axis.

    for (let axis1 = 0; axis1 < this[axis]; axis1++) { // Iterate through each row or column.
      const axisNumbers = []; // Array to store number hints for the current row or column.
      let number = 0; // Counter for consecutive filled squares.
      if (axis === 'rows') {
        row = axis1;
      } else {
        col = axis1;
      }

      for (let axis2 = 0; axis2 < this[subAxis]; axis2++) { // Iterate through each cell in the row or column.
        if (axis === 'rows') {
          col = axis2;
        } else {
          row = axis2;
        }
        if (this.squares[row][col].answer) { // If the square should be filled.
          number += 1; // Increment the counter.
        } else if (number) { // If we encounter an empty square after a sequence of filled squares.
          axisNumbers.unshift(number); // Add the count to the front of the number hints array.
          number = 0; // Reset the counter.
        }
      }
      if (number || axisNumbers.length === 0) { // Add the last count if any, or add 0 if the row/column is empty.
        axisNumbers.unshift(number);
      }

      this[axisToUpdate].push(axisNumbers); // Add the number hints to the axis numbers array.
    }
  }

  /**
   * Draws the squares of the Nonogram grid.
   */
  drawSquares() {
    for (let col = 0; col < this.cols; col++) { // Iterate through each column.
      const HTMLString1 = `<div id="col${col}"></div>`; // Create a container for the column.
      const grid = document.getElementById("grid");
      grid.insertAdjacentHTML('beforeend', HTMLString1); // Add the column container to the grid.

      for (let row = 0; row < this.rows; row++) { // Iterate through each row.
        const HTMLString2 = `<div id="square_${row}_${col}" class="square clickable"></div>`;  // Create a square element.
        const squareRow = document.getElementById(`col${col}`);
        squareRow.insertAdjacentHTML('beforeend', HTMLString2); // Add the square to the column container.
      }
    }
  }

  /**
   * Draws the number hints for a given axis (rows or columns).
   *
   * @param {string} axis - The axis ('row' or 'col').
   */
  drawNumbers(axis) {
    for (let currentAxis = 0; currentAxis < this[`${axis}s`]; currentAxis++) { // Iterate through each row or column.
      const HTMLString1 = `<div id="${axis}${currentAxis}Numbers" class="${axis}Display"></div>`; // Create a container for the number hints.
      const axisNumbers = document.getElementById(`${axis}sNumbers`);

      axisNumbers.insertAdjacentHTML('beforeend', HTMLString1); // Add the number hints container to the axis numbers area.

      for (const number of this[`${axis}sNumbers`][currentAxis]) { // Iterate through each number hint.
        const HTMLString2 = `<div class="number">${number}</div>`; // Create a number hint element.
        const axisNumbers = document.getElementById(`${axis}${currentAxis}Numbers`);

        axisNumbers.insertAdjacentHTML('beforeend', HTMLString2); // Add the number hint to the container.
      }
    }
  }

  // Exits "Reveal Square" state.
  exitReveal() {
    document.getElementById('reveal-overlay').classList.remove('overlay'); // Hide the overlay.
    changeElement(document.getElementById('reveal'), {style: {zIndex: 0}, innerHTML: `Reveal Square<br>${this.reveals - this.revealed.length} Left`}); // Reset reveal button.
    changeElement(document.getElementById('grid'), {style: {zIndex: 0}}); // Reset grid z-index.
    this.isRevealing = false; // Exit reveal state.
  }

  /**
   * Reveals the answer to a selected square.
   * @param {string} squareId - The ID of the square element.
   * @param {object} square - The square object.
   */
  revealSquare(squareId, square) {
    if (!this.isCorrectState(square)) { // If the square is not in the correct state.
      if (square.state === 1) { // If the square is filled.
        square.state = 2; // Mark it with 'X'. 
        this.squaresLeft += 1; // Increment remaining squares.
      } else { // If the square is empty or marked with 'X'.
        square.state = 1; // Fill it.
        this.squaresLeft -= 1; // Decrement remaining squares.
      } 
    } else if (square.state === 0) { // If the square is empty and correct.
      square.state = 2; // Mark it with 'X'.
    }
    changeElement(document.getElementById(squareId), this.squareAttributes[square.state]); // Update the square's visual appearance.
    const idSplit = squareId.split('_');
    const row = idSplit[1], col = idSplit[2];
    this.revealed.push(row + col);
    this.exitReveal(); // Exit reveal state.
  }

  /**
   * Sets display and game conditions so the player can pick a square to reveal. 
   */
  setReveal() {
    document.getElementById('reveal-overlay').classList.add('overlay'); // Show the overlay.
    changeElement(document.getElementById('grid'), {style: {zIndex: 2}}); // Bring the grid to the front.
    changeElement(document.getElementById('reveal'), {style: {zIndex: 2}, textContent: 'Cancel Reveal'}); // Change reveal button text and bring it to the front.
    this.isRevealing = true; // Enter reveal state.
  }
  
  clear() {
    let row = 0, col = 0;
    for (const square_row of this.squares) {
      for (const square_col of square_row) {
        if (!this.revealed.includes(`${row}${col}`) && square_col.state) {
          if (square_col.state === 1) {
            this.squaresLeft++;
          }
          square_col.state = 0;
          changeElement(document.getElementById(`square_${row}_${col}`), this.squareAttributes[0]);
        }
        col++;
      }
      col = 0;
      row++;
    }
  }

  /**
   * Starts a new game.
   */
  startNewGame() { 
    if (this.end) { // If the game has ended, reset the grid and number hints.
      this.squares = [];
      this.rowsNumbers = [];
      this.colsNumbers = [];
      deleteElementByClass('number');
      deleteElementByClass('rowDisplay');
      deleteElementByClass('colDisplay');
    }

    this.initializeNonogram(document.getElementById('dif-selection').value); // Initialize the game grid with the selected difficulty.
    this.determineAxisNumbers('rows');
    this.determineAxisNumbers('cols');

    this.drawNumbers('col');
    this.drawNumbers('row');

    this.end = false;
  }

  /**
   * Resets the page to start a new game.
   */
  resetPage() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('overlay'); // Hide the win message overlay.
    overlay.classList.add('hidden');
    this.startNewGame();
  }

  /**
   * Displays the win message.
   */
  showWinMsg() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden'); // Show the win message overlay.
    overlay.classList.add('overlay');
  }

  /**
   * Handles click events on the game grid and buttons.
   *
   * @param {Event} event - The click event object.
   */
  handleClick(event) {
    if (!this.end) { // If the game is not over.
      if (event.target.classList.contains('square')) { // If a square is clicked.
        const squareId = event.target.id;
        const idSplit = squareId.split('_');
        const row = idSplit[1], col = idSplit[2];

        if (this.isRevealing) { // If in reveal state.
          this.revealSquare(squareId, this.squares[row][col]); // Reveal the square.
        } else if (!this.revealed.includes(`${row}${col}`)) { // If in normal state.
          this.updateSquare(squareId, this.squares[row][col]); // Update the square's state.
        }
        if (!this.squaresLeft) { // If there are as many squares filled as the total to the current difficulty.
          if (this.isGameOver()) { // Check if the game is over.
            this.showWinMsg(); // Show the win message.
          }
        }
        return;
      }
      if (event.target.id === 'reveal' && this.revealed.length < this.reveals) { // If the reveal button is clicked and reveals are available.
        if (this.isRevealing) { // If already in reveal state.
          this.exitReveal(); // Exit reveal state.
          return;
        }
        this.setReveal(); // Enter reveal state.
        return;
      }
      if (event.target.id === 'clear') {
        this.clear();
        return;
      }
    } else if (event.target.id === 'reset-page') { // If the reset button is clicked after the game is over.
      this.resetPage(); // Reset the page.
      return;
    }

    if (event.target.id === 'new-game') { // If the new game button is clicked.
      this.end = true; // Set the game over flag.
      this.startNewGame(); // Start a new game.
    }
  }
}

const nonogram = new Nonogram();

nonogram.drawSquares();
nonogram.startNewGame();

// Add event listener to all clickable elements.
const elementGroup = document.querySelectorAll('.clickable');
elementGroup.forEach(element => { element.addEventListener('click', nonogram.handleClick) });

// Wait for all the elements to load before the page is shown.
window.onload = () => document.body.style.visibility = 'visible';
