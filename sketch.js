let images = [];
let positions = [];
let currentIndex = 0;
let lastMouseX, lastMouseY;
const changeThreshold = 20;
const maxPositions = 20;
let canvas;

function preload() {
  images[0] = loadImage("./assets/cursor-images/hand.png");
  images[1] = loadImage("./assets/cursor-images/pixelHand.png");
  images[2] = loadImage("./assets/cursor-images/cat.png");
  images[3] = loadImage("./assets/cursor-images/manLeaning.png");
  images[4] = loadImage("./assets/cursor-images/orange.png");
  images[5] = loadImage("./assets/cursor-images/foil.png");
  images[6] = loadImage("./assets/cursor-images/super.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
  imageMode(CENTER);
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function draw() {
  background(255);

  for (const position of positions) {
    let imgIndex = position.imgIndex;
    let imgToShow = images[imgIndex];
    let angle = atan2(height - position.y, width - position.x);
    push();
    translate(position.x, position.y);
    rotate(angle);
    image(imgToShow, 0, 0, 350, 350);
    pop();
  }

  let distance = dist(mouseX, mouseY, lastMouseX, lastMouseY);

  if (distance > changeThreshold) {
    positions.push({ x: lastMouseX, y: lastMouseY, imgIndex: currentIndex });

    if (positions.length > maxPositions) {
      positions.shift();
    }

    currentIndex = (currentIndex + 1) % images.length;
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  let currentImage = images[currentIndex];
  let angle = atan2(height - mouseY, width - mouseX);
  push();
  translate(mouseX, mouseY);
  rotate(angle);
  image(currentImage, 0, 0, 350, 350);
  pop();
}

function keyPressed() {
  if (keyCode === DELETE || keyCode === BACKSPACE) {
    positions = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
