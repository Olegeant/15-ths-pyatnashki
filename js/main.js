const CELL_WIDTH = 58;
const CELL_SPACE_WIDTH = 5;
const FIELD_PADDING = 10;

const makefieldMap = num => {
  let counter = 0;
  return Array.from({ length: num }, row =>
    Array.from({ length: num }, cell =>
      ++counter === FIELD_SIZE ** 2 ? 0 : counter,
    ),
  );
};

const findPos = num => {
  const rowPos = fieldMap.reduce(
    (acc, row, idx) => (row.includes(num) ? idx : acc),
    0,
  );
  const colPos = fieldMap[rowPos].indexOf(num);

  return { row: rowPos, col: colPos };
};

const findNum = (row, col) => {
  return fieldMap[row][col];
};

const areCellsAdjacent = (num1, num2 = 0) => {
  const pos1 = findPos(num1);
  const pos2 = findPos(num2);

  if (
    (pos1.row === pos2.row && Math.abs(pos1.col - pos2.col) === 1) ||
    (pos1.col === pos2.col && Math.abs(pos1.row - pos2.row) === 1)
  )
    return true;

  return false;
};

const swapCells = (num1, num2 = 0) => {
  const pos1 = findPos(num1);
  const pos2 = findPos(num2);

  if (areCellsAdjacent(num1, num2)) {
    [fieldMap[pos1.row][pos1.col], fieldMap[pos2.row][pos2.col]] = [
      fieldMap[pos2.row][pos2.col],
      fieldMap[pos1.row][pos1.col],
    ];

    if (isGameSeccionLaunched) {
      moveCounterRef.textContent = ++moveCounter;
    }

    const cell1 = fieldRef.querySelector(`[data-num="${num1}"]`);
    const cell2 = fieldRef.querySelector(`[data-num="${num2}"]`);
    const cell1Text = cell1.querySelector('.cell-num');
    const cell2Text = cell2.querySelector('.cell-num');

    if (num2 === 0) cell2.removeAttribute('data-zero');
    cell1.dataset.num = num2;
    cell2.dataset.num = num1;
    cell1Text.textContent = num2;
    cell2Text.textContent = num1;
    if (num2 === 0) cell1.setAttribute('data-zero', 0);
  }

  if (checkIfFinalized()) {
    endGame();
  }
};

const shuffleField = (prevNum = 0) => {
  const zeroPos = findPos(0);

  const randomDirection = () => {
    let shiftX = 0;
    let shiftY = Math.floor(Math.random() * 2) === 0 ? 1 : -1;
    if (Math.floor(Math.random() * 2) === 0) {
      [shiftX, shiftY] = [shiftY, shiftX];
    }

    return { row: shiftY, col: shiftX };
  };

  while (true) {
    const shift = randomDirection();
    const celToMove =
      fieldMap[zeroPos.row + shift.row][zeroPos.col + shift.col];

    if (
      zeroPos.col + shift.col >= 0 &&
      zeroPos.col + shift.col < FIELD_SIZE &&
      zeroPos.row + shift.row >= 0 &&
      zeroPos.row + shift.row < FIELD_SIZE &&
      celToMove !== prevNum
    ) {
      swapCells(celToMove);

      return fieldMap[zeroPos.row][zeroPos.col];
    }
  }
};

const checkIfFinalized = () => {
  return fieldMap.reduce(
    (acc, row, rowIdx) =>
      acc &&
      row.reduce((acc, cell, colIdx) => {
        return cell === rowIdx * FIELD_SIZE + colIdx + 1 || cell === 0
          ? acc
          : false;
      }, true),
    true,
  );
};

const timerIncrement = () => {
  return (timeCounterRef.textContent = ++timeCounter);
};

const makeCellMarkup = (num = 4) => {
  let counter = 0;
  return Array.from({ length: num ** 2 })
    .map(cell => {
      counter = ++counter === FIELD_SIZE ** 2 ? 0 : counter;
      return `<div class="cell" data-cell data-num="${counter}"${
        counter === 0 ? 'data-zero' : ''
      }><span class="cell-num">${counter}</span></div>`;
    })
    .join('');
};

const renderField = fieldSize => {
  fieldRef.innerHTML = makeCellMarkup(fieldSize);
  fieldMap = makefieldMap(fieldSize);

  const fieldWidth =
    (CELL_WIDTH + 2 * CELL_SPACE_WIDTH) * fieldSize + 2 * FIELD_PADDING + 'px';
  fieldRef.style.width = fieldWidth;
};

const initializeNewGame = () => {
  startButtonRef.setAttribute('disabled', true);
  renderButtonRef.setAttribute('disabled', true);

  fieldRef.addEventListener('click', onCellClick);
  window.addEventListener('keydown', onKeyPressed);
  fieldRef.addEventListener('mousedown', onMouseDown);

  isTimerOn = false;
  moveCounterRef.textContent = moveCounter = 0;
  timeCounterRef.textContent = timeCounter = 0;
  fieldRef.classList.remove('won');
};

const startNewGame = () => {
  isGameSeccionLaunched = true;

  if (!isTimerOn) {
    setTimer = setInterval(() => {
      timerIncrement();
    }, 1000);
    isTimerOn = true;
  }
};

const endGame = () => {
  isGameSeccionLaunched = false;

  clearInterval(setTimer);
  timeCounter = 0;

  console.log('Перемога!!!');

  resetMouseListeners();
  fieldRef.removeEventListener('mousedown', onMouseDown);
  fieldRef.removeEventListener('click', onCellClick);
  window.removeEventListener('keydown', onKeyPressed);

  startButtonRef.removeAttribute('disabled');
  renderButtonRef.removeAttribute('disabled');

  fieldRef.classList.add('won');
};

const onRenderButtonClick = () => {
  FIELD_SIZE = Number(fieldSizeInput.value);
  renderField(FIELD_SIZE);
};

const onShuffleButtonClick = () => {
  if (shuffleButtonRef.getAttribute('disabled')) return;

  shuffleButtonRef.setAttribute('disabled', true);

  let prevNum = 0;
  const timerId = setInterval(() => {
    prevNum = shuffleField(prevNum);
  }, 1);

  setTimeout(() => {
    clearInterval(timerId);
    shuffleButtonRef.removeAttribute('disabled');
  }, 2000);
};

const onCellClick = evt => {
  const targetCell = evt.target.closest('[data-cell]');
  if (!targetCell) return;

  startNewGame();

  const targetNum = Number(targetCell.dataset.num);
  swapCells(targetNum);
};

const onStartButtonClick = () => {
  initializeNewGame();
  onShuffleButtonClick();
};

const onKeyPressed = evt => {
  const key = evt.code;
  if (
    key !== 'ArrowLeft' &&
    key !== 'ArrowRight' &&
    key !== 'ArrowUp' &&
    key !== 'ArrowDown'
  )
    return;

  const zeroPos = findPos(0);

  startNewGame();

  switch (key) {
    case 'ArrowLeft':
      if (zeroPos.col > 0) {
        swapCells(findNum(zeroPos.row, zeroPos.col - 1));
      }
      break;

    case 'ArrowRight':
      if (zeroPos.col < FIELD_SIZE - 1) {
        swapCells(findNum(zeroPos.row, zeroPos.col + 1));
      }
      break;

    case 'ArrowUp':
      if (zeroPos.row > 0) {
        swapCells(findNum(zeroPos.row - 1, zeroPos.col));
      }
      break;

    case 'ArrowDown':
      if (zeroPos.row < FIELD_SIZE - 1) {
        swapCells(findNum(zeroPos.row + 1, zeroPos.col));
      }
      break;
  }
};

const setMouseListeners = () => {
  isMouseDownOnZero = true;
  fieldRef.removeEventListener('mousedown', onMouseDown);
  fieldRef.addEventListener('mouseup', onMouseUp);
  fieldRef.addEventListener('mouseover', onMouseOver);
  fieldRef.addEventListener('mouseout', onMouseOut);
};

const resetMouseListeners = () => {
  isMouseDownOnZero = false;
  fieldRef.addEventListener('mousedown', onMouseDown);
  fieldRef.removeEventListener('mouseup', onMouseUp);
  fieldRef.removeEventListener('mouseover', onMouseOver);
  fieldRef.removeEventListener('mouseout', onMouseOut);
};

const onMouseDown = evt => {
  const targetCell = evt.target.closest('[data-cell]');
  if (!targetCell) return;

  if (!targetCell.hasAttribute('data-zero')) return;

  setMouseListeners();
};

const onMouseUp = evt => {
  resetMouseListeners();
};

const onMouseOver = evt => {
  if (!isMouseDownOnZero) return;

  const targetCell = evt.target.closest('[data-cell]');
  if (!targetCell) return;

  const targetNum = Number(targetCell.dataset.num);
  if (targetNum === 0) return;

  if (!areCellsAdjacent(targetNum, 0)) return;

  startNewGame();
  swapCells(targetNum);
};

const onMouseOut = evt => {
  if (evt.relatedTarget.closest('[data-field]')) return;

  resetMouseListeners();
};

let FIELD_SIZE = 4;
let fieldMap;
let moveCounter = 0,
  timeCounter = 0;
let isTimerOn = false;
let isGameSeccionLaunched = false;
let timerId, setTimer;
let isMouseDownOnZero = false;

const fieldSizeInput = document.querySelector('[data-input]');
const renderButtonRef = document.querySelector('[data-action="render"]');

const fieldRef = document.querySelector('[data-field]');
const shuffleButtonRef = document.querySelector('[data-action="shuffle"]');
const startButtonRef = document.querySelector('[data-action="start"]');

const moveCounterRef = document.querySelector('[data-action="movecounter"]');
const timeCounterRef = document.querySelector('[data-action="timecounter"]');

renderField(FIELD_SIZE);

shuffleButtonRef.addEventListener('click', onShuffleButtonClick);
startButtonRef.addEventListener('click', onStartButtonClick);
renderButtonRef.addEventListener('click', onRenderButtonClick);
