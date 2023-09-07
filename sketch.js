let images = [];
let positions = [];
let currentIndex = 0;
let lastMouseX, lastMouseY;
const changeThreshold = 20;
const maxPositions = 20;
let canvas;

// make the hand point to the menu items

function preload() {
  images[0] = loadImage("./assets/cursor-images/hand.png");
  images[1] = loadImage("./assets/cursor-images/foil.png");
  images[2] = loadImage("./assets/cursor-images/cat.png");
  images[3] = loadImage("./assets/cursor-images/orange.png");
  images[4] = loadImage("./assets/cursor-images/ink.png");
  images[5] = loadImage("./assets/cursor-images/calligraphy.png");
  images[6] = loadImage("./assets/cursor-images/secondHand.png");
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
    image(imgToShow, position.x, position.y, 350, 350);
  }

  let distance = dist(mouseX, mouseY, lastMouseX, lastMouseY);

  // Check if the cursor moved beyond the threshold
  if (distance > changeThreshold) {
    positions.push({ x: lastMouseX, y: lastMouseY, imgIndex: currentIndex });

    if (positions.length > maxPositions) {
      positions.shift(); // Remove the first element
    }

    currentIndex = (currentIndex + 1) % images.length;
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  let currentImage = images[currentIndex];
  image(currentImage, mouseX, mouseY, 350, 350);
}

function keyPressed() {
  if (keyCode === DELETE || keyCode === BACKSPACE) {
    positions = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
