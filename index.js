const PAPER_RATIO = [1.4, 1];
const PAPER_WIDTH = 1684; // pixels
const PAPER_DATA = {'size': [], 'lines': []};  // dictionary with saved data
const COLORS = {
  'paper': "#ffffff",
  'line': "#000000",
  'lineStart': "#1bb27f",
  'lineEnd': "#ff4040"
}
let CTX = null; // CTX of the paintingArea canvas
let lineNumberFontSize = 10;

function repaint(){
  // Paint on white paper
  CTX.fillStyle = COLORS['paper'];
  CTX.fillRect(0, 0, ...PAPER_DATA['size']);

  // Paint all lines
  for (let i = 0; i < PAPER_DATA['lines'].length; i++) {
    let line = PAPER_DATA['lines'][i];
    CTX.fillStyle = COLORS['line'];
    CTX.beginPath();
    CTX.moveTo(...line['start']);
    CTX.lineTo(...line['end']);
    CTX.closePath();
    CTX.stroke();

    CTX.font = "30px sans-serif"
    CTX.fillStyle = COLORS['lineStart'];
    CTX.fillText(i.toString(), ...line['start']);
    CTX.fillStyle = COLORS['lineEnd'];
    CTX.fillText(i.toString(), ...line['end']);
  }
}

window.onload = () => {
  let paintingArea = document.querySelector('#paintingArea');
  let paintingAreaWidth = window.innerWidth * 0.8;
  let paintRatio = PAPER_RATIO[0] * PAPER_RATIO[1];
  paintingArea.style.width = paintingAreaWidth + 'px';
  paintingArea.style.height = (paintingAreaWidth / paintRatio) + 'px';
  paintingArea.width = PAPER_WIDTH;
  paintingArea.height = Math.round(PAPER_WIDTH / paintRatio);
  CTX = paintingArea.getContext('2d');

  PAPER_DATA['size'].push(paintingArea.width);
  PAPER_DATA['size'].push(paintingArea.height);

  let screenRation = paintingArea.width / paintingAreaWidth;

  let mouseMode = "awaitingFirstClick";
  let mouseData = null;
  paintingArea.addEventListener('click', (e) => {
    let rect = paintingArea.getBoundingClientRect();
    let clickPos = [(e.x - rect.left) * screenRation, (e.y - rect.top) * screenRation];
    switch(mouseMode){
      case "awaitingFirstClick":
        mouseData = clickPos;
        mouseMode = "awaitingSecondClick";
        break;
      case "awaitingSecondClick":
        PAPER_DATA['lines'].push({'start': mouseData, 'end': clickPos});
        mouseData = null;
        mouseMode = "awaitingFirstClick";
        repaint();
        break;
    }
  });
}
