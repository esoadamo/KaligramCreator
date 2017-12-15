const PAPER_RATIO = [1.4, 1];
const PAPER_WIDTH = 1684; // pixels
let PAPER_DATA = {
  'size': [],
  'fontColor': '#000000',
  'fontSize': 30,
  'font': 'sans-serif',
  'text': '',
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

const LINES_REDO = []; // list of lines deleted with undo button

let LAST_SAVE = null; // URL of last exported save

function repaint() {
  let text = TXT_AREA.value.replace('\n', ' '); // painted text
  let drawLines = document.querySelector('#drawLines').checked;
  let drawLineNumbers = document.querySelector('#drawLineNumbers').checked;
  let drawText = document.querySelector('#drawText').checked;
  let fontColor = document.querySelector('#textColor').value;
  let fontSize = document.querySelector('#fontSize').value;
  let font = document.querySelector('#font').value;
  PAPER_DATA['fontColor'] = fontColor;
  PAPER_DATA['fontSize'] = fontSize;
  PAPER_DATA['font'] = font;
  PAPER_DATA['text'] = text;

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
      // Draw start only on a real start of the line (not on the start of a turn)
      if ((i == 0) || (PAPER_DATA['lines'][i - 1]['end'] != line['start'])) {
        CTX.fillStyle = COLORS['lineStart'];
        CTX.fillText(i.toString(), ...line['start']);
      }
      CTX.fillStyle = COLORS['lineEnd'];
      CTX.fillText(i.toString(), ...line['end']);
    }

    if (drawText && (text.length > 0)) {
      let textOnThisLine = "";
      let lineWidth = Math.sqrt(Math.pow(Math.abs(line['start'][0] - line['end'][0]), 2) + Math.pow(Math.abs(line['start'][1] - line['end'][1]), 2));
      CTX.fillStyle = fontColor;
      CTX.font = `${fontSize}px ${font}`;
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
      let textX = 0;
      // If we are moving backwards with the text, reverse it ad start writing from the end - this is the only way to have the text readable
      if (line['start'][0] > line['end'][0]) {
        textOnThisLine = textOnThisLine.split('').reverse().join('');
        textX = -CTX.measureText(textOnThisLine).width;
      }
      CTX.save();
      CTX.translate(...line['start']);
      CTX.rotate(lineAngle);
      CTX.fillText(textOnThisLine, textX, 0);
      CTX.restore();
    }
  }
}

/* Functional, but deactivated
function save() {
  let data = new Blob([JSON.stringify(PAPER_DATA)], {
    type: 'text/plain'
  });

  if (LAST_SAVE !== null) {
    window.URL.revokeObjectURL(LAST_SAVE);
  }
  LAST_SAVE = window.URL.createObjectURL(data);

  let link = document.createElement('a');
  link.download = "kaligram.kl";
  link.href = LAST_SAVE;
  link.click();
};*/

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
        paintingArea.style.cursor = "var(--cursor-end)";
        break;
      case "painting":
        PAPER_DATA['lines'].push({
          'start': mouseData,
          'end': clickPos
        });
        mouseData = clickPos;
        LINES_REDO.length = 0;
        repaint();
        break;
    }
  });
  // Stop painting upon press of the ESCape
  document.body.addEventListener('keyup', (e) => {
    const key = e.keyCode ? e.keyCode : e.which;

    switch (key) {
      case 27: // ESC
        // End painting
        if (mouseMode != "prePaint") {
          mouseMode = "prePaint";
          mouseData = null;
          paintingArea.style.cursor = "var(--cursor-start)";
        }
        break;
    }
  });

  // Load & save button
  btnSave = document.querySelector('#btnSave');
  btnSave.addEventListener('click', () => {
    let copyarea = document.createElement('textarea');
    document.body.appendChild(copyarea);
    copyarea.value = JSON.stringify(PAPER_DATA);
    copyarea.select();
    document.execCommand('copy');
    document.body.removeChild(copyarea);
    alert('Copied to clipboard');
  });
  btnLoad = document.querySelector('#btnLoad');
  btnLoad.addEventListener('click', () => {
    let txtSave = prompt("Enter the content of saved file");
    PAPER_DATA = JSON.parse(txtSave);
    let fontColor = document.querySelector('#textColor');
    let fontSize = document.querySelector('#fontSize');
    let font = document.querySelector('#font').value;
    fontColor.value = PAPER_DATA['fontColor'];
    fontSize.value = PAPER_DATA['fontSize'];
    font.value = PAPER_DATA['font'];
    TXT_AREA.value = PAPER_DATA['text'];
    if ((mouseData != null) && (PAPER_DATA['lines'].length > 0))
      mouseData = PAPER_DATA['lines'][PAPER_DATA['lines'].length - 1]['end'];
    repaint();
  });

  // Undo / redo button
  btnUndo = document.querySelector('#btnUndo');
  btnUndo.addEventListener('click', () => {
    if (PAPER_DATA['lines'].length == 0)
      return;
    LINES_REDO.push(PAPER_DATA['lines'].pop());
    if (mouseData != null)
      mouseData = PAPER_DATA['lines'][PAPER_DATA['lines'].length - 1]['end'];
    repaint();
  });
  btnRedo = document.querySelector('#btnRedo');
  btnRedo.addEventListener('click', () => {
    if (LINES_REDO.length == 0)
      return;
    PAPER_DATA['lines'].push(LINES_REDO.pop());
    if (mouseData != null)
      mouseData = PAPER_DATA['lines'][PAPER_DATA['lines'].length - 1]['end'];
    repaint();
  });

  // Add listeners to settings
  [document.querySelector('#drawLines'), document.querySelector('#drawLineNumbers'), document.querySelector('#drawText'), document.querySelector('#textColor'), document.querySelector('#fontSize')]
  .forEach((e) => {
    e.addEventListener('change', repaint);
  });
  [document.querySelector('#font'), TXT_AREA].forEach((e) => {
    e.addEventListener('input', repaint)
  });
}
