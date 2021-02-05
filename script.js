"use strict";
let Puzzle = {
  elementsGame: {
    /*main: null,
    playingField: null,
    informationContainer: null,
    timeInput: null,
    moveContainer: null,
    pauseButton: null,
    chipsContainer: null,*/
    // chips: []
  },

  /* elementsMenu: {
    menuContainer: null,
    buttonsContainer: null,
    buttons: []
  },

  properties: {
    value: ""
  },*/

  init() {
    // Create main elements
    this.elementsGame.main = document.createElement("div");
    this.elementsGame.informationContainer = document.createElement("div");
    this.elementsGame.timeInputContainer = document.createElement("div");
    this.elementsGame.timeInputLabel = document.createElement("span");
    this.elementsGame.timeInput = document.createElement("input");
    this.elementsGame.moveCountContainer = document.createElement("div");
    this.elementsGame.moveCountLabel = document.createElement("span");
    this.elementsGame.moveCount = document.createElement("input");
    this.elementsGame.pauseButton = document.createElement("input");
    this.elementsGame.newGameButton = document.createElement("input");
    this.elementsGame.playingField = document.createElement("div");

    // Setup main elements
    this.elementsGame.main.classList.add("main__container");
    this.elementsGame.main.id = "main";
    this.elementsGame.informationContainer.classList.add("information__panel");
    this.elementsGame.timeInputContainer.classList.add("time__container");
    this.elementsGame.timeInputLabel.classList.add("label");
    this.elementsGame.timeInputLabel.textContent = "Время: ";
    this.elementsGame.timeInput.classList.add("time");
    this.elementsGame.timeInput.id = "time";
    this.elementsGame.timeInput.size = "4";
    this.elementsGame.timeInput.value = "00:00:00";
    this.elementsGame.moveCountContainer.classList.add("moveCountContainer");
    this.elementsGame.moveCountLabel.classList.add("label");
    this.elementsGame.moveCount.classList.add("moveCount");
    this.elementsGame.moveCount.id = "moveCount";
    this.elementsGame.moveCountLabel.textContent = "Ход: ";
    this.elementsGame.moveCount.size = "1";
    this.elementsGame.moveCount.value = 0;
    this.elementsGame.pauseButton.classList.add("button");
    this.elementsGame.pauseButton.type = "button";
    this.elementsGame.pauseButton.id = "button";
    this.elementsGame.pauseButton.value = "Старт";
    this.elementsGame.newGameButton.classList.add("button");
    this.elementsGame.newGameButton.type = "button";
    this.elementsGame.newGameButton.id = "newGameButton";
    this.elementsGame.newGameButton.value = "Новая игра";
    this.elementsGame.timeInputContainer.appendChild(
      this.elementsGame.timeInputLabel
    );
    this.elementsGame.timeInputContainer.appendChild(
      this.elementsGame.timeInput
    );
    this.elementsGame.informationContainer.appendChild(
      this.elementsGame.timeInputContainer
    );
    this.elementsGame.moveCountContainer.appendChild(
      this.elementsGame.moveCountLabel
    );
    this.elementsGame.moveCountContainer.appendChild(
      this.elementsGame.moveCount
    );
    this.elementsGame.informationContainer.appendChild(
      this.elementsGame.moveCountContainer
    );
    this.elementsGame.informationContainer.appendChild(
      this.elementsGame.pauseButton
    );
    this.elementsGame.informationContainer.appendChild(
      this.elementsGame.newGameButton
    );
    this.elementsGame.playingField.classList.add("playing__field");
    this.elementsGame.playingField.appendChild(this.createChipsLayout());

    // Add to DOM
    this.elementsGame.main.appendChild(this.elementsGame.informationContainer);
    this.elementsGame.main.appendChild(this.elementsGame.playingField);
    document.body.appendChild(this.elementsGame.main);

    //assign the chips to be dragged, fix the starting position of the chips, set up event handlers
    Puzzle.assignDraggedChips();
    Puzzle.startPositionChips();
    document.addEventListener("mousedown", Puzzle.moveChip);
    document.addEventListener("click", Puzzle.clicksHandler);
  },

  //generate a random number from min to max+1
  randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  },

  //create a solvable combination of chips
  createChipsLayout() {
    let fragment = document.createDocumentFragment();
    let chipsLayout = [];
    let valueChips;

    while (chipsLayout.length < 16) {
      valueChips = this.randomInteger(1, 16);

      if (chipsLayout.indexOf(valueChips) < 0) {
        chipsLayout.push(valueChips);
      }
    }

    //check the layout for solvability (https://ru.wikipedia.org/wiki/%D0%98%D0%B3%D1%80%D0%B0_%D0%B2_15)
    let numberStringEmptyChip;
    if (chipsLayout.indexOf(16) < 4) {
      numberStringEmptyChip = 1;
    } else if (chipsLayout.indexOf(16) > 3 && chipsLayout.indexOf(16) < 8) {
      numberStringEmptyChip = 2;
    } else if (chipsLayout.indexOf(16) > 7 && chipsLayout.indexOf(16) < 12) {
      numberStringEmptyChip = 3;
    } else {
      numberStringEmptyChip = 4;
    }

    let indexLastChip = chipsLayout.indexOf(16);
    let copyChipsLayout = chipsLayout.slice();
    copyChipsLayout.splice(indexLastChip, 1); //Deleted elem with value "16"

    let solvability = copyChipsLayout.reduce(
      (accumulate, elValue, indexValue, arr) => {
        for (let i = indexValue; i < arr.length; ++i) {
          if (elValue > arr[i]) {
            ++accumulate;
          }
        }
        return accumulate;
      },
      0
    );

    if ((solvability + numberStringEmptyChip) % 2 === 0) {
      chipsLayout.forEach((chip) => {
        let chipElement = document.createElement("div");
        chipElement.classList.add("chip");
        chipElement.textContent = chip;
        //make the sixteenth chip empty
        if (chip == 16) {
          chipElement.classList.add("empty");
          chipElement.id = "empty";
        }
        fragment.appendChild(chipElement);
      });
    } else {
      this.elementsGame.playingField.appendChild(this.createChipsLayout());
    }

    return fragment;
  },

  //assign dragged chips
  assignDraggedChips() {
    let emptyChip = document.getElementById("empty");
    let coordinatesEmptyChip = emptyChip.getBoundingClientRect();

    let leftDraggedChipX =
      coordinatesEmptyChip.left - coordinatesEmptyChip.width / 2;
    let leftDraggedChipY =
      coordinatesEmptyChip.top + coordinatesEmptyChip.height / 2;
    let leftDraggingChip = document.elementFromPoint(
      leftDraggedChipX,
      leftDraggedChipY
    );
    if (leftDraggingChip.className === "chip") {
      leftDraggingChip.classList.add("dragged");
    }

    let upperDraggedChipX =
      coordinatesEmptyChip.left + coordinatesEmptyChip.width / 2;
    let upperDraggedChipY =
      coordinatesEmptyChip.top - coordinatesEmptyChip.height / 2;
    let upperDraggingChip = document.elementFromPoint(
      upperDraggedChipX,
      upperDraggedChipY
    );
    if (upperDraggingChip.className === "chip") {
      upperDraggingChip.classList.add("dragged");
    }

    let rightDraggedChipX =
      coordinatesEmptyChip.left +
      coordinatesEmptyChip.width +
      coordinatesEmptyChip.width / 2;
    let rightDraggedChipY =
      coordinatesEmptyChip.top + coordinatesEmptyChip.height / 2;
    let rightDraggingChip = document.elementFromPoint(
      rightDraggedChipX,
      rightDraggedChipY
    );
    if (rightDraggingChip.className === "chip") {
      rightDraggingChip.classList.add("dragged");
    }

    let bottomDraggedChipX =
      coordinatesEmptyChip.left + coordinatesEmptyChip.width / 2;
    let bottomDraggedChipY =
      coordinatesEmptyChip.top +
      coordinatesEmptyChip.height +
      coordinatesEmptyChip.height / 2;
    let bottomDraggingChip = document.elementFromPoint(
      bottomDraggedChipX,
      bottomDraggedChipY
    );
    if (bottomDraggingChip.className === "chip") {
      bottomDraggingChip.classList.add("dragged");
    }
  },

  //we fix the starting coordinates of the chips and set their absolute position
  startPositionChips() {
    let chips = document.getElementsByClassName("chip");
    for (let i = chips.length - 1; i >= 0; i--) {
      let chip = chips[i];
      chip.style.left = chip.offsetLeft + "px";
      chip.style.top = chip.offsetTop + "px";
      chip.style.position = "absolute";
    }
  },

  //we implement the movement of chips by clicking and through drag and drop and counting moves
  countMove: 0,
  moveChip(event) {
    event.preventDefault();
    let mouseDownCoordsX = event.pageX;
    let mouseDownCoordsY = event.pageY;
    let emptyChip = document.getElementById("empty");
    let emptyChipCoordsX = emptyChip.offsetLeft;
    let emptyChipCoordsY = emptyChip.offsetTop;
    let target = event.target;

    if (target.className == "chip dragged") {
      let draggedChip = target;
      let draggedChipCoordsX = draggedChip.offsetLeft;
      let draggedChipCoordsY = draggedChip.offsetTop;
      let shiftX = event.pageX - draggedChipCoordsX;
      let shiftY = event.pageY - draggedChipCoordsY;

      document.onmousemove = chipMouseMove;
      function chipMouseMove(event) {
        draggedChip.style.left = event.pageX - shiftX + "px";
        draggedChip.style.top = event.pageY - shiftY + "px";
        draggedChip.style.zIndex = 1000;
      }

      document.onmouseup = chipMouseUp;
      function chipMouseUp(event) {
        event.preventDefault();
        document.onmousemove = null;
        document.onmouseup = null;

        if (
          event.pageX > emptyChip.getBoundingClientRect().left &&
          event.pageX <
            emptyChip.getBoundingClientRect().left +
              emptyChip.getBoundingClientRect().width &&
          event.pageY > emptyChip.getBoundingClientRect().top &&
          event.pageY <
            emptyChip.getBoundingClientRect().top +
              emptyChip.getBoundingClientRect().height
        ) {
          ++Puzzle.countMove;
          document.getElementById("moveCount").value = Puzzle.countMove; //Displaying the number of moves in the DOM-element
          emptyChip.style.left = draggedChipCoordsX + "px";
          emptyChip.style.top = draggedChipCoordsY + "px";
          draggedChip.style.left = emptyChipCoordsX + "px";
          draggedChip.style.top = emptyChipCoordsY + "px";

          let chips = document.getElementsByClassName("chip");
          for (let i = chips.length - 1; i >= 0; i--) {
            let chip = chips[i];
            if (chip.textContent != 16) {
              chip.className = "chip";
              draggedChip.style.zIndex = 0;
            }
          }
          Puzzle.assignDraggedChips();
        } else if (
          mouseDownCoordsX == event.pageX &&
          mouseDownCoordsY == event.pageY
        ) {
          ++Puzzle.countMove;
          document.getElementById("moveCount").value = Puzzle.countMove; //Displaying the number of moves in the DOM-element
          emptyChip.style.left = draggedChipCoordsX + "px";
          emptyChip.style.top = draggedChipCoordsY + "px";
          draggedChip.style.left = emptyChipCoordsX + "px";
          draggedChip.style.top = emptyChipCoordsY + "px";

          let chips = document.getElementsByClassName("chip");
          for (let i = chips.length - 1; i >= 0; i--) {
            let chip = chips[i];
            if (chip.textContent != 16) {
              chip.className = "chip";
              draggedChip.style.zIndex = 0;
            }
          }
          Puzzle.assignDraggedChips();
        } else {
          emptyChip.style.left = emptyChipCoordsX + "px";
          emptyChip.style.top = emptyChipCoordsY + "px";
          draggedChip.style.left = draggedChipCoordsX + "px";
          draggedChip.style.top = draggedChipCoordsY + "px";

          let countMove = document.getElementById("moveCount").value;

          let chips = document.getElementsByClassName("chip");
          for (let i = chips.length - 1; i >= 0; i--) {
            let chip = chips[i];
            if (chip.textContent != 16) {
              draggedChip.style.zIndex = 0;
            }
          }
        }
      }
    }
  },

  //
  startDate: null,
  initT: 0,
  clockTimer: null,
  timeStore: 0,

  clicksHandler(event) {
    let target = event.target;
    if (target.id == "button" && Puzzle.initT == 0) {
      Puzzle.startDate = new Date();
      Puzzle.initT = 1;
      let button = document.getElementById("button");
      button.value = "Пауза";
      Puzzle.startTime();
    } else if (target.id == "button" && Puzzle.initT == 1) {
      Puzzle.startDate = new Date(Puzzle.timeStore);
      Puzzle.initT = 2;
      let button = document.getElementById("button");
      button.value = "Старт";
      Puzzle.startTime();
    } else if (target.id == "button" && Puzzle.initT == 2) {
      Puzzle.startDate = new Date(Puzzle.timeStore);
      Puzzle.initT = 1;
      let button = document.getElementById("button");
      button.value = "Пауза";
      Puzzle.startTime();
    } else if (target.id == "newGameButton") {
      let game = document.getElementById("main");
      game.remove();
      clearTimeout(Puzzle.clockTimer);
      Puzzle.countMove = 0;
      Puzzle.init();
    }
  },

  startTime() {
    let thisDate = new Date();
    let t = thisDate.getTime() - Puzzle.startDate.getTime();
    Puzzle.timeStore = t;
    console.log(t, thisDate.getTime(), Puzzle.startDate.getTime());
    let ms = t % 1000;
    t -= ms;
    t = Math.floor(t / 1000);
    let s = t % 60;
    t -= s;
    t = Math.floor(t / 60);
    let m = t % 60;
    t -= m;
    t = Math.floor(t / 60);
    let h = t % 60;
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    if (Puzzle.initT == 1)
      document.getElementById("time").value = h + ":" + m + ":" + s;
    Puzzle.clockTimer = setTimeout("Puzzle.startTime()", 100);
  },
};

window.addEventListener("DOMContentLoaded", function () {
  Puzzle.init();
});
