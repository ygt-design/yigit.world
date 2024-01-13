let images = [];
let positions = [];
let currentIndex = 0;
let lastMouseX, lastMouseY;
const changeThreshold = 15;
const maxPositions = 25;
let canvas;

function preload() {
  images[0] = loadImage("./assets/cursor-images/line.png");
  images[1] = loadImage("./assets/cursor-images/pixelHand.png");
  images[2] = loadImage("./assets/cursor-images/fold.png");
  images[3] = loadImage("./assets/cursor-images/manLeaning.png");
  images[4] = loadImage("./assets/cursor-images/hand.png");
  images[5] = loadImage("./assets/cursor-images/pyramid.png");
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

  // Handle the disappearance animation for the oldest image
  if (positions.length > 0) {
    let oldestPosition = positions[0];
    let oldestImage = images[oldestPosition.imgIndex];

    let distanceToMouse = dist(
      oldestPosition.x,
      oldestPosition.y,
      mouseX,
      mouseY
    );
    let scaleValue = map(distanceToMouse, 0, width, 1, 0);

    push();
    translate(oldestPosition.x, oldestPosition.y);
    rotate(atan2(height - oldestPosition.y, width - oldestPosition.x));
    scale(scaleValue);
    image(oldestImage, 0, 0, 350, 350);
    pop();
  }

  // Draw the other images
  for (let i = 1; i < positions.length; i++) {
    let position = positions[i];
    let imgIndex = position.imgIndex;
    let imgToShow = images[imgIndex];

    let distanceToMouse = dist(position.x, position.y, mouseX, mouseY);
    let scaleValue = map(distanceToMouse, 0, width, 1, 0);

    push();
    translate(position.x, position.y);
    rotate(atan2(height - position.y, width - position.x));
    scale(scaleValue);
    image(imgToShow, 0, 0, 350, 350);
    pop();
  }

  let distance = dist(mouseX, mouseY, lastMouseX, lastMouseY);

  if (distance > changeThreshold) {
    positions.push({
      x: lastMouseX,
      y: lastMouseY,
      imgIndex: currentIndex,
    });

    if (positions.length > maxPositions) {
      positions.shift();
    }

    currentIndex = (currentIndex + 1) % images.length;
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function keyPressed() {
  if (keyCode === DELETE || keyCode === BACKSPACE) {
    positions = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
