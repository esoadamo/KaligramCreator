const PAPER_RATIO = [1.4, 1];
const PAPER_WIDTH = 1684; // pixels
const PAPER_DATA = {
  'size': [],
  'fontColor': '#000000',
  'lines': []
}; // dictionary with saved data
const COLORS = {
  'paper': "#ffffff",
  'line': "#000000",
  'lineStart': "#1bb27f",
  'lineEnd': "#ff4040"
}
let CTX = null; // CTX of the paintingArea canvas
let TXT_AREA = null; // the txt area with printed text

let lineNumberFontSize = 10;

const FONT_SIZE = 30; // TODO make more scalable
const FONT = "sans-serif"; // TODO make more adjustable

function repaint() {
  let text = TXT_AREA.value.replace('\n', ' '); // painted text
  let drawLines = document.querySelector('#drawLines').checked;
  let drawLineNumbers = document.querySelector('#drawLineNumbers').checked;
  let drawText = document.querySelector('#drawText').checked;
  let fontColor = document.querySelector('#textColor').value;
  PAPER_DATA['fontColor'] = fontColor;

  // Paint on white paper
  CTX.fillStyle = COLORS['paper'];
  CTX.fillRect(0, 0, ...PAPER_DATA['size']);

  // Paint all lines
  for (let i = 0; i < PAPER_DATA['lines'].length; i++) {
    let line = PAPER_DATA['lines'][i];

    if (drawLines) {
      CTX.fillStyle = COLORS['line'];
      CTX.beginPath();
      CTX.moveTo(...line['start']);
      CTX.lineTo(...line['end']);
      CTX.closePath();
      CTX.stroke();
    }

    if (drawLineNumbers) {
      CTX.font = "30px sans-serif"
      CTX.fillStyle = COLORS['lineStart'];
      CTX.fillText(i.toString(), ...line['start']);
      CTX.fillStyle = COLORS['lineEnd'];
      CTX.fillText(i.toString(), ...line['end']);
    }

    if (drawText && (text.length > 0)) {
      let textOnThisLine = "";
      let lineWidth = Math.sqrt(Math.pow(Math.abs(line['start'][0] - line['end'][0]), 2), Math.pow(Math.abs(line['start'][1] - line['end'][1]), 2));
      CTX.fillStyle = fontColor;
      CTX.font = `${FONT_SIZE}px ${FONT}`;
      while ((CTX.measureText(textOnThisLine).width < lineWidth) && (text.length > 0)) {
        textOnThisLine += text.substring(0, 1);
        text = text.substring(1);
      }

      // We have overflown the length of the line by last character. Don't be mean and return this little fella to the rest of the text.
      if (CTX.measureText(textOnThisLine).width > lineWidth) {
        text = textOnThisLine.substring(textOnThisLine.length - 1) + text;
        textOnThisLine = textOnThisLine.substring(0, textOnThisLine.length - 1);
      }

      let lineAngle = Math.atan((line['end'][1] - line['start'][1]) / (line['end'][0] - line['start'][0]));
      CTX.save();
      CTX.translate(...line['start']);
      CTX.rotate(lineAngle);
      CTX.fillText(textOnThisLine, 0, 0);
      CTX.restore();
    }
  }
}

window.onload = () => {
  // Init global DOM variables
  TXT_AREA = document.querySelector('#paintedText');

  // Set paintingArea size
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

  let mouseMode = "prePaint";
  let mouseData = null;
  paintingArea.addEventListener('click', (e) => {
    let rect = paintingArea.getBoundingClientRect();
    let clickPos = [(e.x - rect.left) * screenRation, (e.y - rect.top) * screenRation];
    switch (mouseMode) {
      case "prePaint":
        mouseData = clickPos;
        mouseMode = "painting";
        break;
      case "painting":
        PAPER_DATA['lines'].push({
          'start': mouseData,
          'end': clickPos
        });
        mouseData = clickPos;
        repaint();
        break;
    }
  });

  // Add listeners to settings
  [document.querySelector('#drawLines'), document.querySelector('#drawLineNumbers'), document.querySelector('#drawText'), document.querySelector('#textColor')]
  .forEach((e) => {
    e.addEventListener('change', repaint);
  });
  TXT_AREA.addEventListener('input', repaint);
}
