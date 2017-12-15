const PAPER_RATIO = [1.4, 1]

window.onload = () => {
  let paintingArea = document.querySelector('#paintingArea');
  let paintWidth = window.innerWidth * 0.8;
  paintingArea.style.width = paintWidth + 'px';
  paintingArea.style.height = (paintWidth / PAPER_RATIO[0] * PAPER_RATIO[1]) + 'px';
}
