function changeElement(element, attributes) {
  if (element === null) {
    console.log('Null element');
    return;
  }
  for (const attribute in attributes) {
    const value = attributes[attribute];
    if (typeof value === 'object' && value !== null) {
      for (const subAttribute in value) {
        changeElement(element[attribute], {[subAttribute]: value[subAttribute]});
      }
    }
    else element[attribute] = value;
  }
}

function deleteElementByClass(divClass) {
  const elementGroup = document.querySelectorAll(`.${divClass}`);
  for (const element of elementGroup) {
    element.remove();
  }
}

class Nonogram {
  
  constructor(rows=8, cols=8, sqEasy=40, sqMedium=32, sqHard=24, revEasy=0, revMedium=1, revHard=2) {
    this.end = false;
    this.rows = rows;
    this.cols = cols;
    this.squares = [];
    this.rowsNumbers = [];
    this.colsNumbers = [];
    this.revealTable = {
      Easy: revEasy,
      Medium: revMedium,
      Hard: revHard
    };
    this.reveals = 0;
    this.filledSquares = {
      Easy: sqEasy,
      Medium: sqMedium,
      Hard: sqHard
    };
    this.squareAttributes = {
      0: {style: {background: 'white'}, textContent: ''},
      1: {style: {background: 'var(--square-filled-bg)'}},
      2: {style: {background: 'white'}, textContent: 'X'}
    };
    this.handleClick = this.handleClick.bind(this);
    this.resetPage = this.resetPage.bind(this);
  }
  
  initializeNonogram(difficulty) {
    let filledSquaresLeft = this.filledSquares[difficulty];
    const squaresToFill = [];
    this.reveals = this.revealTable[difficulty];
    const revealElement = document.getElementById('reveal');
    revealElement.innerHTML = `Reveal Square<br>${this.reveals} Left`;
    const difficultyElement = document.getElementById('difficulty');
    difficultyElement.innerText = difficulty;

    while (filledSquaresLeft) {
      let randomSquare = Math.floor(Math.random() * this.rows * this.cols);
      if (!squaresToFill.includes(randomSquare)) {
        squaresToFill.push(randomSquare);
        filledSquaresLeft -= 1;
      }
    }
    
    for (let row = 0; row < this.rows; row++) {
      const rowSquares = [];

      for (let col = 0; col < this.cols; col++) {
        let answer = 0;
        if (squaresToFill.includes(this.cols * row + col)) {
          answer = 1;
        }
        rowSquares.push({state: 0, answer: answer});
        if (this.end) {
          const sqElement = document.getElementById(`square_${row}_${col}`);
          changeElement(sqElement, this.squareAttributes[0]);
        }
      }

      this.squares.push(rowSquares);
    }
  }
  
  isCorrectState(square) {
    return square.state % 2 === square.answer % 2;
  }
  
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
  
  updateSquare(squareId) {
    const idSplit = squareId.split('_');
    const row = idSplit[1], col = idSplit[2];
    const element =  document.getElementById(squareId);

    if (this.squares[row][col].state < 2) {
      this.squares[row][col].state += 1;
    } else {
      this.squares[row][col].state = 0;
    }

    changeElement(element, this.squareAttributes[this.squares[row][col].state]);
  }
  
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
        if(this.squares[row][col].answer) {
          number += 1;
        }
        else if (number) {
          axisNumbers.unshift(number);
          number = 0;
        }
      }
      if (number || axisNumbers.length === 0) {
        axisNumbers.unshift(number);
      }

      this[axisToUpdate].push(axisNumbers);
    }

    console.log(this[axisToUpdate]);
  }
  
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
  
  revealSquare() {
    let row = Math.floor(Math.random() * this.rows);
    let col = Math.floor(Math.random() * this.cols);
    
    while (this.isCorrectState(this.squares[row][col])) {
      row = Math.floor(Math.random() * this.rows);
      col = Math.floor(Math.random() * this.cols);
    }
    
    const element =  document.getElementById(`square_${row}_${col}`);
    this.squares[row][col].state = this.squares[row][col].answer * -1 + 2;
    
    changeElement(element, this.squareAttributes[this.squares[row][col].state]);
    this.reveals -= 1;
    const revealElement = document.getElementById('reveal');
    revealElement.innerHTML = `Reveal Square<br>${this.reveals} Left`;
    
  }
  
  startNewGame() {
    if (this.end) {
      this.squares = [];
      this.rowsNumbers = [];
      this. colsNumbers = [];
      deleteElementByClass('number');
      deleteElementByClass('rowDisplay');
      deleteElementByClass('colDisplay');
    }
    
    this.initializeNonogram(document.getElementById('dif-selection').value);
    this.determineAxisNumbers('rows');
    this.determineAxisNumbers('cols');
    for (const row of this.squares) {
      let str = "";
      for (const col of row) {
        str += col.answer;
      }
      console.log(str);
    }

    this.drawNumbers('col');
    this.drawNumbers('row');
    
    this.end= false;
  }
  
  resetPage() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('overlay');
    overlay.classList.add('hidden');
    this.startNewGame();
  }
  
  showWinMsg() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('overlay');
  }
  
  handleClick(event) {
    if(!this.end) {
      if (event.target.classList.contains('square')) {
        this.updateSquare(event.target.id);
        if (this.isGameOver()) {
          this.showWinMsg();
        }
        return;
      } 
      if (event.target.id === 'reveal' && this.reveals) {
        this.revealSquare();
        if (this.isGameOver()) {
          this.showWinMsg();
        }
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

const elementGroup = document.querySelectorAll('.clickable');
elementGroup.forEach(element => {element.addEventListener('click', nonogram.handleClick)});

window.onload = function() {         document.querySelector('body').style.visibility = 'visible';};
