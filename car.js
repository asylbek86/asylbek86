(function () {
  let isPause = false;
  let animationId = null;

  let speed = 3;
  let score = 0;

  const car = document.querySelector(".car");
  const carInfo = {
    ...createElementInfo(car),
    move: {
      top: null,
      bottom: null,
      left: null,
      right: null,
    },
  };

  const coin = document.querySelector(".coin");
  const coinInfo = createElementInfo(coin);

  const arrow = document.querySelector(".arrow");
  // const arrowInfo = createElementInfo(arrow)

  const danger = document.querySelector(".danger");
  const dangerInfo = createElementInfo(danger);

  const road = document.querySelector(".road");
  const roadHeight = road.clientHeight;
  const roadWidth = road.clientWidth / 2;

  const gameButton = document.querySelector(".game-btn");
  const gameScore = document.querySelector(".game-score");

  const backdrop = document.querySelector(".backdrop");
  const restartButton = document.querySelector(".restart-button");
  const trees = document.querySelectorAll(".tree");

  const treesCoords = [];

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    const coordsTree = getCoords(tree);

    treesCoords.push(coordsTree);
  }

  //keydown keyup

  document.addEventListener("keydown", (event) => {
    // if (isPause) {
    //   return;
    // }

    const code = event.code;

    if (code === "ArrowUp" && carInfo.top === null) {
      if (carInfo.bottom) {
        return;
      }
      carInfo.top = requestAnimationFrame(carMoveToTop);
    } else if (code === "ArrowDown" && carInfo.bottom === null) {
      if (carInfo.top) {
        return;
      }
      carInfo.bottom = requestAnimationFrame(carMoveToBottom);
    } else if (code === "ArrowLeft" && carInfo.left === null) {
      if (carInfo.right) {
        return;
      }
      carInfo.left = requestAnimationFrame(carMoveToLeft);
    } else if (code === "ArrowRight" && carInfo.right === null) {
      if (carInfo.left) {
        return;
      }
      carInfo.right = requestAnimationFrame(carMoveToRight);
    }
  });

  document.addEventListener("keyup", (event) => {
    const code = event.code;

    if (code === "ArrowUp") {
      cancelAnimationFrame(carInfo.top);
      carInfo.top = null;
    } else if (code === "ArrowDown") {
      cancelAnimationFrame(carInfo.bottom);
      carInfo.bottom = null;
    } else if (code === "ArrowLeft") {
      cancelAnimationFrame(carInfo.left);
      carInfo.left = null;
    } else if (code === "ArrowRight") {
      cancelAnimationFrame(carInfo.right);
      carInfo.right = null;
    }
  });

  function createElementInfo(element) {
    return {
      width: element.clientWidth / 2,
      height: element.clientHeight,
      coords: getCoords(element),
      visible: true,
    };
  }

  function carMoveToTop() {
    const newY = carInfo.coords.y - 5;

    if (newY < 0) {
      return;
    }
    carInfo.coords.y = newY;
    carMove(carInfo.coords.x, newY);
    carInfo.top = requestAnimationFrame(carMoveToTop);
  }

  function carMoveToBottom() {
    const newY = carInfo.coords.y + 5;

    if (newY + carInfo.height > roadHeight) {
      return;
    }
    carInfo.coords.y = newY;
    carMove(carInfo.coords.x, newY);
    carInfo.bottom = requestAnimationFrame(carMoveToBottom);
  }

  function carMoveToLeft() {
    const newX = carInfo.coords.x - 5;
    console.log(newX);
    if (newX < -roadWidth + carInfo.width) {
      return;
    }

    carInfo.coords.x = newX;
    carMove(newX, carInfo.coords.y);
    carInfo.left = requestAnimationFrame(carMoveToLeft);
  }

  function carMoveToRight() {
    const newX = carInfo.coords.x + 5;

    if (newX > roadWidth - carInfo.width) {
      return;
    }
    carInfo.coords.x = newX;
    carMove(newX, carInfo.coords.y);
    carInfo.right = requestAnimationFrame(carMoveToRight);
  }

  function carMove(x, y) {
    car.style.transform = `translate(${x}px, ${y}px)`;
  }

  animationId = requestAnimationFrame(startGame);

  function startGame() {
    elementAnimation(danger, dangerInfo, -250);

    if (hasCollision(carInfo, dangerInfo)) {
      return finishGame();
    }

    treesAnimation();
    elementAnimation(coin, coinInfo, -100);

    if (coinInfo.visible && hasCollision(carInfo, coinInfo)) {
      console.log("test");
      score++;
      gameScore.innerText = score;
      coin.style.display = "none";
      coinInfo.visible = false;

      if (score % 3 === 0) {
        speed += 2;
      }
    }

    // elementAnimation(arrow, arrowInfo.coords, arrowInfo.width, -600);

    animationId = requestAnimationFrame(startGame);
  }

  function treesAnimation() {
    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i];
      const coords = treesCoords[i];

      let newYCoord = coords.y + speed;

      if (newYCoord > window.innerHeight) {
        newYCoord = -320;
      }

      treesCoords[i].y = newYCoord;
      tree.style.transform = `translate(${coords.x}px, ${newYCoord}px)`;
    }
  }

  function elementAnimation(elem, elemInfo, elemInitialYCoord) {
    let newYCoord = elemInfo.coords.y + speed;
    let newXCoord = elemInfo.coords.x;

    if (newYCoord > window.innerHeight) {
      newYCoord = elemInitialYCoord;
      const direction = parseInt(Math.random() * 2);
      const maxXCoord = roadWidth + 1 - elemInfo.width;
      const randomXCoord = parseInt(Math.random() * maxXCoord);

      // if (direction === 0) {
      //   // двигаем влево
      //   //roadWidth
      //   newXCoord = -randomXCoord;
      // } else if (direction === 1) {
      //   // двигаем вправо

      //   newXCoord = randomXCoord;
      // }

      elem.style.display = "initial";
      elemInfo.visible = true;

      newXCoord = direction === 0 ? -randomXCoord : randomXCoord;
    }

    elemInfo.coords.y = newYCoord;
    elemInfo.coords.x = newXCoord;
    elem.style.transform = `translate(${newXCoord}px, ${newYCoord}px)`;
  }

  function getCoords(element) {
    const matrix = window.getComputedStyle(element).transform;
    const array = matrix.split(",");
    const y = array[array.length - 1];
    const x = array[array.length - 2];
    const numericY = parseFloat(y);
    const numericX = parseFloat(x);

    return { x: numericX, y: numericY };
  }

  function hasCollision(element1Info, element2Info) {
    const carYTop = element1Info.coords.y;
    const carYBottom = element1Info.coords.y + element1Info.height;

    const carXLeft = element1Info.coords.x - element1Info.width;
    const carXRight = element1Info.coords.x + element1Info.width;

    const coinYTop = element2Info.coords.y;
    const coinYBottom = element2Info.coords.y + element2Info.height;

    const coinXLeft = element2Info.coords.x - element2Info.width;
    const coinXRight = element2Info.coords.x + element2Info.width;

    // y
    if (carYTop > coinYBottom || carYBottom < carYTop) {
      return false;
    }

    if (carXLeft > coinXRight || carXRight < coinXLeft) {
      return false;
    }

    return true;
  }

  function cancelAnimations() {
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(carInfo.top);
    cancelAnimationFrame(carInfo.bottom);
    cancelAnimationFrame(carInfo.left);
    cancelAnimationFrame(carInfo.right);
  }

  function finishGame() {
    cancelAnimations();

    gameScore.style.display = "none";
    backdrop.style.display = "flex";
    const scoreText = backdrop.querySelector(".finish-text-score");
    scoreText.innerText = score;
  }

  gameButton.addEventListener("click", () => {
    isPause = !isPause;
    if (isPause) {
      cancelAnimations();

      gameButton.children[0].style.display = "none";
      gameButton.children[1].style.display = "initial";
    } else {
      animationId = requestAnimationFrame(startGame);
      gameButton.children[0].style.display = "initial";
      gameButton.children[1].style.display = "none";
    }
  });
  restartButton.addEventListener("click", () => {
    window.location.reload();
  });
})();
3;
