// Conway's topograph, implemented with p5.js in global mode.

const BG_COLOR = '#000000';
const FG_COLOR = '#ffffff';
const POSITIVE_COLOR = '#00ffff';
const NEGATIVE_COLOR = '#ff00ff';
const ZERO_COLOR = '#00ff00';

let turtle;
let matrix = [[1, 0], [0, 1]];
let qa = 1;
let qb = 1;
let qc = 1;
let stepDistance = 80;
let branchRatio = 1;
let branchAngle = 45;
let treeIterations = 4;

function setup() {
  const canvas = createCanvas(500, 600);
  canvas.parent('sketch-container');
  pixelDensity(1);
  turtle = new Turtle();
  setIdentityMatrix();
  noLoop();
  redraw();
}

function draw() {
  background(BG_COLOR);
  fill(FG_COLOR);
  stroke(FG_COLOR);

  turtle.penup();
  turtle.home();
  turtle.pendown();

  drawTree(turtle, stepDistance, branchRatio, branchAngle, treeIterations, true, matrix);
  turtle.forward(stepDistance);
  turtle.left(180);

  updateMatrixTurnAround(matrix);
  drawTree(turtle, stepDistance, branchRatio, branchAngle, treeIterations, true, matrix);
  updateMatrixTurnAround(matrix);
  matrix = matrix.map((row) => row.map((value) => -value));

  turtle.penup();
  turtle.home();
  turtle.pendown();
  turtle.forward(stepDistance / 2);
  drawArrow(turtle);

  textAlign(LEFT);
  fill(FG_COLOR);
  text(`Quadratic form: (${qa},${qb},${qc})   D = ${qb * qb - 4 * qa * qc}`, 10, height - 50);
}

function drawArrow(t) {
  t.left(135);
  t.forward(10);
  t.back(10);
  t.left(90);
  t.forward(10);
  t.back(10);
  t.left(135);
}

function undrawArrow(t) {
  t.penerase();
  drawArrow(t);
  t.pendown();
  t.forward(2);
  t.back(4);
  t.forward(2);
}

function pixelFound(x, y) {
  const centerX = Math.trunc(x);
  const centerY = Math.trunc(y);
  for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      const px = centerX + offsetX;
      const py = centerY + offsetY;
      if (px < 0 || px >= width || py < 0 || py >= height) continue;
      const index = 4 * (py * width + px);
      if (pixels[index + 3] > 0 && (pixels[index] !== 0 || pixels[index + 1] !== 0 || pixels[index + 2] !== 0)) {
        return true;
      }
    }
  }
  return false;
}

function updateMatrixLeft(m) {
  m[0][1] = m[0][0] + m[0][1];
  m[1][1] = m[1][0] + m[1][1];
}

function updateMatrixRight(m) {
  m[0][0] += m[0][1];
  m[1][0] += m[1][1];
}

function updateMatrixBackLeft(m) {
  m[0][1] = -m[0][0] + m[0][1];
  m[1][1] = -m[1][0] + m[1][1];
}

function updateMatrixBackRight(m) {
  m[0][0] -= m[0][1];
  m[1][0] -= m[1][1];
}

function updateMatrixTurnAround(m) {
  const firstColumn = [m[0][0], m[1][0]];
  m[0][0] = -m[0][1];
  m[1][0] = -m[1][1];
  m[0][1] = firstColumn[0];
  m[1][1] = firstColumn[1];
}

function changeQuadraticForm(a, b, c) {
  qa = Number(a);
  qb = Number(b);
  qc = Number(c);
  setIdentityMatrix();
  redraw();
}

function setIdentityMatrix() {
  matrix = [[1, 0], [0, 1]];
}

function keyPressed() {
  loadPixels();

  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    turtle.penup();
    turtle.forward(stepDistance / 2);

    if (!pixelFound(turtle.getx(), turtle.gety())) {
      turtle.back(stepDistance / 2);
      turtle.pendown();
      return false;
    }

    turtle.back(stepDistance / 2);
    turtle.pendown();
    undrawArrow(turtle);
    turtle.forward(stepDistance / 2);

    if (keyCode === LEFT_ARROW) turtle.left(45);
    else turtle.right(45);

    turtle.penup();
    turtle.forward(5);
    loadPixels();
    if (!pixelFound(turtle.getx(), turtle.gety())) {
      turtle.back(5);
      if (keyCode === LEFT_ARROW) turtle.left(45);
      else turtle.right(45);
    } else {
      turtle.back(5);
    }
    turtle.pendown();
    turtle.forward(stepDistance / 2);
    drawArrow(turtle);

    if (keyCode === LEFT_ARROW) updateMatrixLeft(matrix);
    else updateMatrixRight(matrix);
    return false;
  }

  if (keyCode === DOWN_ARROW) {
    undrawArrow(turtle);
    turtle.left(180);
    drawArrow(turtle);
    updateMatrixTurnAround(matrix);
    return false;
  }

  if (key === ' ') {
    redraw();
    return false;
  }

  if (keyCode === ENTER || keyCode === RETURN) {
    setIdentityMatrix();
    redraw();
    return false;
  }

  return true;
}

function drawTree(t, distance, ratio, angle, iterations, printData, currentMatrix) {
  if (iterations === 0) return;

  if (printData) {
    t.forward(distance / 2);
    t.right(90);
    t.penup();
    t.forward(distance / 2);
    t.pendown();
    textAlign(CENTER);

    let x = currentMatrix[0][1];
    let y = currentMatrix[1][1];
    if (y < 0 || (y === 0 && x < 0)) {
      x = -x;
      y = -y;
    }

    const qValue = qa * x * x + qb * x * y + qc * y * y;
    if (qValue > 0) fill(POSITIVE_COLOR);
    else if (qValue < 0) fill(NEGATIVE_COLOR);
    else fill(ZERO_COLOR);
    text(`(${x},${y})\n${qValue}`, t.getx(), t.gety());

    t.penup();
    t.back(distance / 2);
    t.left(90);
    t.pendown();
    t.forward(iterations > 1 ? distance / 2 : distance / 2 - 6);
  } else {
    t.forward(iterations > 1 ? distance : distance - 6);
  }

  t.left(angle);
  const oldMatrix = currentMatrix.map((row) => row.slice());

  updateMatrixLeft(currentMatrix);
  drawTree(t, distance * ratio, ratio, angle, iterations - 1, true, currentMatrix);
  currentMatrix[0] = oldMatrix[0].slice();
  currentMatrix[1] = oldMatrix[1].slice();

  t.right(2 * angle);
  updateMatrixRight(currentMatrix);
  drawTree(t, distance * ratio, ratio, angle, iterations - 1, false, currentMatrix);
  currentMatrix[0] = oldMatrix[0].slice();
  currentMatrix[1] = oldMatrix[1].slice();

  t.left(angle);
  t.back(iterations > 1 ? distance : distance - 6);
}

class Turtle {
  constructor() {
    this.x = Math.trunc(width / 2);
    this.y = Math.trunc(height / 2);
    this.oldX = this.x;
    this.oldY = this.y;
    this.heading = 0;
    this.turtleColor = FG_COLOR;
    stroke(this.turtleColor);
  }

  forward(distance) {
    this.x = this.oldX - Math.trunc(distance * cos(radians(this.heading + 90)));
    this.y = this.oldY - Math.trunc(distance * sin(radians(this.heading + 90)));
    line(this.oldX, this.oldY, this.x, this.y);
    this.oldX = this.x;
    this.oldY = this.y;
  }

  back(distance) {
    this.x = this.oldX + Math.trunc(distance * cos(radians(this.heading + 90)));
    this.y = this.oldY + Math.trunc(distance * sin(radians(this.heading + 90)));
    line(this.oldX, this.oldY, this.x, this.y);
    this.oldX = this.x;
    this.oldY = this.y;
  }

  home() {
    this.x = Math.trunc(width / 2);
    this.y = Math.trunc(height / 2);
    line(this.oldX, this.oldY, this.x, this.y);
    this.oldX = this.x;
    this.oldY = this.y;
    this.heading = 0;
  }

  left(degrees) { this.heading -= degrees; }
  right(degrees) { this.heading += degrees; }
  pencolor(newColor) { this.turtleColor = newColor; stroke(this.turtleColor); }
  penup() { noStroke(); }
  pendown() { stroke(this.turtleColor); }
  penerase() { stroke(BG_COLOR); }
  getx() { return this.x; }
  gety() { return this.y; }
}
