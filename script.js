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
   * @param {number} [revHard=2] - Number of reveals for hard difficulty.
   */
  constructor(rows = 8, cols = 8, sqEasy = 40, sqMedium = 32, sqHard = 24, revEasy = 0, revMedium = 1, revHard = 2) {
    this.end = false; // Flag to indicate if the game is over.
    this.rows = rows; // Number of rows.
    this.cols = cols; // Number of columns.
    this.squares = []; // 2D array representing the game grid.
    this.rowsNumbers = []; // Array to store row number hints.
    this.colsNumbers = []; // Array to store column number hints.
    this.revealTable = { Easy: revEasy, Medium: revMedium, Hard: revHard }; // Object mapping difficulty to reveal counts.
    this.reveals = 0; // Remaining reveals.
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
   * Checks if the entire grid is correct (game over condition).
   *
   * @returns {boolean} - True if the game is over, false otherwise.
   */
  isGameOver() {
    for (const row of this.squares) {
      for (const square of row) {
        if (!this.isCorrectState(square)) {
          return false;
        }
      }
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

    if (square.state < 2) {
      square.state += 1;
    } else {
      square.state = 0;
    }

    changeElement(element, this.squareAttributes[square.state]);
  }

  /**
   * Determines the number hints for a given axis (rows or columns).
   *
   * @param {string} axis - The axis ('rows' or 'cols').
   */
  determineAxisNumbers(axis) {
    let row, col, subAxis;
    const axisToUpdate = `${axis}Numbers`;
    if (axis === 'rows') {
      subAxis = 'cols';
    } else {
      subAxis = 'rows';
    }

    for (let axis1 = 0; axis1 < this[axis]; axis1++) {
      const axisNumbers = [];
      let number = 0;
      if (axis === 'rows') {
        row = axis1;
      } else {
        col = axis1;
      }

      for (let axis2 = 0; axis2 < this[subAxis]; axis2++) {
        if (axis === 'rows') {
          col = axis2;
        } else {
          row = axis2;
        }
        if (this.squares[row][col].answer) {
          number += 1;
        } else if (number) {
          axisNumbers.unshift(number);
          number = 0;
        }
      }
      if (number || axisNumbers.length === 0) {
        axisNumbers.unshift(number);
      }

      this[axisToUpdate].push(axisNumbers);
    }
  }

  /**
   * Draws the squares of the Nonogram grid.
   */
  drawSquares() {
    for (let col = 0; col < this.cols; col++) {
      const HTMLString1 = `<div id="col${col}"></div>`;
      const grid = document.getElementById("grid");
      grid.insertAdjacentHTML('beforeend', HTMLString1);

      for (let row = 0; row < this.rows; row++) {
        const HTMLString2 = `<div id="square_${row}_${col}" class="square clickable"></div>`;
        const squareRow = document.getElementById(`col${col}`);
        squareRow.insertAdjacentHTML('beforeend', HTMLString2);
      }
    }
  }

  /**
   * Draws the number hints for a given axis (rows or columns).
   *
   * @param {string} axis - The axis ('row' or 'col').
   */
  drawNumbers(axis) {
    for (let currentAxis = 0; currentAxis < this[`${axis}s`]; currentAxis++) {
      const HTMLString1 = `<div id="${axis}${currentAxis}Numbers" class="${axis}Display"></div>`;
      const axisNumbers = document.getElementById(`${axis}sNumbers`);

      axisNumbers.insertAdjacentHTML('beforeend', HTMLString1);

      for (const number of this[`${axis}sNumbers`][currentAxis]) {
        const HTMLString2 = `<div class="number">${number}</div>`;
        const axisNumbers = document.getElementById(`${axis}${currentAxis}Numbers`);

        axisNumbers.insertAdjacentHTML('beforeend', HTMLString2);
      }
    }
  }

  /**
   * Reveals the answer to a selected square.
   * @param {string} squareId - The ID of the square element.
   * @param {object} square - The square object.
   */
  revealSquare(squareId, square) {
    // Apply a math operation that makes the state change to 1 if the answer is 1, and 2 if it's 0
    // (We want it to be 2 because it will display an X)
    square.state = square.answer * -1 + 2;
    changeElement(document.getElementById(squareId), this.squareAttributes[square.state]);
    this.reveals -= 1;
    document.getElementById('reveal').innerHTML = `Reveal Square<br>${this.reveals} Left`;
    document.getElementById('reveal-overlay').classList.remove('overlay');
    changeElement(document.getElementById('grid'), {style: {zIndex: 0}});
    this.isRevealing = false;
  }

  /**
   * Set display and game conditions so the player can choose a square to reveal. 
   */
  setReveal() {
    document.getElementById('reveal-overlay').classList.add('overlay');
    changeElement(document.getElementById('grid'), {style: {zIndex: 2}});
    this.isRevealing = true;
  }

  /**
   * Starts a new game.
   */
  startNewGame() {
    if (this.end) {
      this.squares = [];
      this.rowsNumbers = [];
      this.colsNumbers = [];
      deleteElementByClass('number');
      deleteElementByClass('rowDisplay');
      deleteElementByClass('colDisplay');
    }

    this.initializeNonogram(document.getElementById('dif-selection').value);
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
    overlay.classList.remove('overlay');
    overlay.classList.add('hidden');
    this.startNewGame();
  }

  /**
   * Displays the win message.
   */
  showWinMsg() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('overlay');
  }

  /**
   * Handles click events on the game grid and buttons.
   *
   * @param {Event} event - The click event object.
   */
  handleClick(event) {
    if (!this.end) {
      if (event.target.classList.contains('square')) {
        const squareId = event.target.id;
        const idSplit = squareId.split('_');
        const row = idSplit[1], col = idSplit[2];

        if (this.isRevealing) {
          this.revealSquare(squareId, this.squares[row][col]);
        } else {
          this.updateSquare(squareId, this.squares[row][col]);
        }
        if (this.isGameOver()) {
          this.showWinMsg();
        }
        return;
      }
      if (event.target.id === 'reveal' && this.reveals) {
        this.setReveal();
        return;
      }
    } else if (event.target.id === 'reset-page') {
      this.resetPage();
      return;
    }

    if (event.target.id === 'new-game') {
      this.end = true;
      this.startNewGame();
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
