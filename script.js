const field = document.querySelector('.field')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
const moveDelayLine = document.querySelector('input[type=range]')
const scoreElement = document.querySelector('.score')
const amountSpeed = document.querySelector('.amount-speed')


const colors = ['empty', 'purple', 'cyan', 'yellow', 'orange ', 'green']
const cellSize = 30
const colCount = 10
const rowCount = 20
const shapes = {
  'T': {
    color: 1,
    coords: [
      [[4, 0], [4, 1], [5, 1], [3, 1]],
      [[4, 0], [4, 1], [5, 1], [4, 2]],
      [[4, 0], [5, 0], [6, 0], [5, 1]],
      [[4, 0], [4, 1], [4, 2], [3, 1]],
    ]
  },
  'I': {
    color: 2,
    coords: [
      [[4, 0], [4, 1], [4, 2], [4, 3]],
      [[3, 0], [4, 0], [5, 0], [6, 0]],
    ]
  },
  '□': {
    color: 3,
    coords: [
      [[4, 0], [4, 1], [5, 0], [5, 1]],

    ]
  },
  'L': {
    color: 4,
    coords: [
      [[4, 0], [4, 1], [4, 2], [5, 2]],
      [[4, 0], [4, 1], [4, 2], [3, 2]],
      [[4, 0], [4, 1], [5, 1], [6, 1]],
      [[4, 0], [5, 0], [4, 1], [4, 2]]
    ]
  },
  'S': {
    color: 5,
    coords: [
      [[5, 0], [6, 0], [4, 1], [5, 1]],
      [[5, 0], [5, 1], [6, 1], [6, 2]],
      [[4, 0], [5, 0], [5, 1], [6, 1]],

    ]
  }

}
let gameField = Array.from({ length: 20 }, () => Array(10).fill(0))
let moveDelay = +moveDelayLine.value * 100
let activeFigure = []
let rotationIndex = 0
let renderFigure = []
let gameInterval = setInterval(nextGameStep, moveDelay)
let randomNumber
let score = 0
let nowColor = 1

showAmountSpeed()
canvas.width = cellSize * colCount
canvas.height = cellSize * rowCount
field.appendChild(canvas)

activeFigure = getRandomShape()


const shift = {
  x: 0, y: 0
}

moveDelayLine.onchange = (e) => {
  moveDelay = +(e.target.value) * 100

  clearInterval(gameInterval)
  gameInterval = setInterval(nextGameStep, moveDelay)
}
const changeEvent = new Event('change')

onkeydown = (e) => {
  if (e.code === 'ArrowLeft' && canMove('left')) {
    moveLeft()
  }
  else if (e.code === 'ArrowRight' && canMove('right')) {
    moveRight()
  }
  else if (e.code === 'ArrowUp') {
    rotateShape()
  }
  else if (e.code === 'ArrowDown' && canMove('down')) {
    moveDown()
  }
  else if (e.code === 'Minus') {
    gameSpeedDecrise()
  }
  else if (e.code === 'Equal') {
    gameSpeedIncrease()
  }
  render()
}

function nextGameStep() {
  if (canMove('down')) {
    moveDown()
  }
  else {
    stopFigure()
    getNewFigure()
    calcActualCoords()

    if (!canMove('down')) {
      alert('default')
      startNewGame()
    }
  }

  render()
}

function startNewGame() {
  gameField = Array.from({ length: 20 }, () => Array(10).fill(0))
}

function calcActualCoords() {
  renderFigure = activeFigure.map(([coordX, coordY]) => [coordX + shift.x, coordY + shift.y])
}

function getNewFigure() {
  activeFigure = getRandomShape()
  shift.y = 0
  shift.x = 0
}

function stopFigure() {
  activeFigure.forEach(([coordX, coordY]) => {
    gameField[coordY + shift.y][coordX + shift.x] = Object.values(shapes)[randomNumber].color
  })

}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < colCount; x++) {
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }
}

function render() {
  drawGrid()
  deleteFullRows()
  const cleanInertCoords = getCleanInertCoords()

  drawFillCells(cleanInertCoords)

}

function drawFillCells(cleanInertCoords) {
  const gameState = renderFigure.concat(cleanInertCoords)

  gameState.forEach(([coordX, coordY]) => {
    ctx.fillStyle = colors[gameField[coordY][coordX] || Object.values(shapes)[randomNumber].color]
    ctx.fillRect(coordX * cellSize, coordY * cellSize, cellSize - 1, cellSize - 1)
  })
}

function getCleanInertCoords() {
  const inertCells = gameField
  const dirtyCoords = inertCells.flatMap(
    (row, y) => row.map(
      (cell, x) => cell && [x, y]
    )
  )
  return dirtyCoords.filter(Boolean)
}

function getRandomShape() {
  const shape = Object.values(shapes)
  randomNumber = Math.floor(Math.random() * shape.length)

  const figure = shape[randomNumber].coords
  ctx.fillStyle = colors[Object.values(shapes)[randomNumber].color]
  return [...figure[rotationIndex]]
}

function canMove(direction) {
  if (direction === 'left') {
    return canMoveLeft()
  }
  if (direction === 'right') {
    return canMoveRight()
  }
  if (direction === 'down') {
    return canMoveDown()
  }
}

function canMoveLeft() {
  const nextFigure = getNextFigure(-1, 0)

  return nextFigure.every(([coordX, coordY]) => coordX >= 0) && checkExistCell(nextFigure)
}

function canMoveRight() {
  const nextFigure = getNextFigure(1, 0)

  return nextFigure.every(([coordX, coordY]) => coordX < colCount) && checkExistCell(nextFigure)
}

function canMoveDown() {
  const nextFigure = getNextFigure(0, 1)

  return nextFigure.every(([coordX, coordY]) => coordY < rowCount) && checkExistCell(nextFigure)
}

function getNextFigure(shiftX, shiftY) {
  return renderFigure.map(([coordX, coordY]) => [coordX + shiftX, coordY + shiftY])
}

function checkExistCell(nextFigure) {
  return nextFigure.every(([coordX, coordY]) => gameField[coordY][coordX] < 1)
}

function rotateShape() {
  const shape = Object.values(shapes)
  const figure = shape[randomNumber].coords

  rotationIndex = (rotationIndex + 1) % shape[randomNumber].coords.length

  activeFigure = figure[rotationIndex]
}

function deleteFullRows() {
  const inert = getInertCells()
  updateScore(inert)

  assignGameField(inert)
}

function getInertCells() {
  return gameField.filter(
    row => row.some(cell => cell == 0)
  )
}

function assignGameField(inert) {
  gameField = [
    ...Array.from({ length: 20 - inert.length }, () => Array(10).fill(0)),
    ...inert
  ]
}

function moveRight() {
  shift.x += 1
  renderFigure = activeFigure.map(([coordX, coordY]) => [coordX + shift.x, coordY + shift.y])
}

function moveLeft() {
  shift.x -= 1
  renderFigure = activeFigure.map(([coordX, coordY]) => [coordX + shift.x, coordY + shift.y])
}

function moveDown() {
  shift.y++
  renderFigure = activeFigure.map(([coordX, coordY]) => [coordX + shift.x, coordY + shift.y])
}

function updateScore(inert) {
  score += (20 - inert.length) * 10

  scoreElement.textContent = score
}

function showAmountSpeed() {
  amountSpeed.textContent = moveDelayLine.value
}

function gameSpeedDecrise() {
  if (moveDelayLine.value > 1) {
    moveDelayLine.value--
    moveDelayLine.dispatchEvent(changeEvent)
    showAmountSpeed()
  }
}

function gameSpeedIncrease() {
  if (moveDelayLine.value < 10) {
    moveDelayLine.value++
    moveDelayLine.dispatchEvent(changeEvent)
    showAmountSpeed()
  }
}