const sketch = (p) => {
  let x = 100;
  let y = 100;
  let brushSize = 17;
  let f = false;
  let spring = 2.5;
  let friction = 0.4;
  let v = 0.5;
  let r = 0;
  let vx = 0;
  let vy = 0;
  let splitNum = 100;
  let diff = 2;
  let strokeColor;

  p.setup = function () {
    const canvasWidth = document.getElementById("question-detail").offsetWidth;
    const canvasHeight =
      document.getElementById("question-detail").offsetHeight;

    p.createCanvas(canvasWidth - 50, canvasHeight - 50).parent(
      "question-detail"
    );
    p.background(255);
    createColorSquares();
  };

  p.draw = function () {
    p.stroke(strokeColor || p.color(0, 0, 255));

    if (p.mouseIsPressed) {
      if (!f) {
        f = true;
        x = p.mouseX;
        y = p.mouseY;
      }
      vx += (p.mouseX - x) * spring;
      vy += (p.mouseY - y) * spring;
      vx *= friction;
      vy *= friction;

      v += p.sqrt(vx * vx + vy * vy) - v;
      v *= 0.55;

      let oldR = r;
      r = brushSize - v;
      for (let i = 0; i < splitNum; ++i) {
        let oldX = x;
        let oldY = y;
        x += vx / splitNum;
        y += vy / splitNum;
        oldR += (r - oldR) / splitNum;
        if (oldR < 1) {
          oldR = 1;
        }
        p.strokeWeight(oldR + diff);
        p.line(
          x + p.random(0, 2),
          y + p.random(0, 2),
          oldX + p.random(0, 2),
          oldY + p.random(0, 2)
        );
        p.strokeWeight(oldR);
        p.line(
          x + diff * p.random(0.1, 2),
          y + diff * p.random(0.1, 2),
          oldX + diff * p.random(0.1, 2),
          oldY + diff * p.random(0.1, 2)
        );
        p.line(
          x - diff * p.random(0.1, 2),
          y - diff * p.random(0.1, 2),
          oldX - diff * p.random(0.1, 2),
          oldY - diff * p.random(0.1, 2)
        );
      }
    } else if (f) {
      vx = vy = 0;
      f = false;
    }
  };

  function createColorSquares() {
    p.fill(255, 0, 0);
    p.rect(10, 10, 30, 30);

    p.fill(0, 255, 0);
    p.rect(50, 10, 30, 30);

    p.fill(0, 0, 255);
    p.rect(90, 10, 30, 30);
  }

  p.mouseClicked = function () {
    if (p.mouseX >= 10 && p.mouseX <= 40 && p.mouseY >= 10 && p.mouseY <= 40) {
      strokeColor = p.color(255, 0, 0);
    } else if (
      p.mouseX >= 50 &&
      p.mouseX <= 80 &&
      p.mouseY >= 10 &&
      p.mouseY <= 40
    ) {
      strokeColor = p.color(0, 255, 0);
    } else if (
      p.mouseX >= 90 &&
      p.mouseX <= 120 &&
      p.mouseY >= 10 &&
      p.mouseY <= 40
    ) {
      strokeColor = p.color(0, 0, 255);
    }
  };

  p.windowResized = function () {
    const containerWidth =
      document.getElementById("question-detail").offsetWidth;
    const containerHeight =
      document.getElementById("question-detail").offsetHeight;
    p.resizeCanvas(containerWidth - 50, containerHeight - 50);
    p.background(255);
  };
};

new p5(sketch);
