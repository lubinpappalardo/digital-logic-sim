const paper = document.getElementById("wires");
const pen = paper.getContext("2d");
const wireColorOff = rootStyles.getPropertyValue('--discreettext');
const wireColorOn = rootStyles.getPropertyValue('--primary');
const wireActive = rootStyles.getPropertyValue('--accent');

let WiringStartPin;
let WiringStartComponent;
let WiringEndPin;
let WiringEndComponent;
let IsWiring = false;

/* ---- WIRING ---- */

let WiringMouseCoords = {
  x: 0,
  y: 0
}

$(document).on('click', '.out-pins', function (e) {
  if (!IsWiring && $(e.target).hasClass('pin')) {
    WiringStartPin = $(e.target).attr('class').split(' ')[1];
    WiringStartComponent = $(e.target).parent().parent().attr('id');
    IsWiring = true;
    WiringMouseCoords = {
      x: e.pageX,
      y: e.pageY
    }
  }
});

$(document).mousemove(function (e) {
  if (IsWiring) {
    WiringMouseCoords = {
      x: e.pageX,
      y: e.pageY
    }
  }
});

$(document).on('click', function (e) {
  if (IsWiring && !$(e.target).hasClass('pin')) {
    IsWiring = false;
  }
});

$(document).on('click', '.in-pins', function (e) {
  if (IsWiring && $(e.target).hasClass('pin')) {
    WiringEndPin = $(e.target).attr('class').split(' ')[1];
    WiringEndComponent = $(e.target).parent().parent().attr('id');
    
    const arrayToOutput = diagram[WiringStartComponent].outputs[WiringStartPin].to;
    const arrayFromInput = diagram[WiringEndComponent].inputs[WiringEndPin].from;
    const connectionToOutput = {component: WiringEndComponent, pin: WiringEndPin};
    const connectionFromOutput = {component: WiringStartComponent, pin: WiringStartPin};
    const exists = arrayToOutput.find(obj => obj.component === connectionToOutput.component && obj.pin === connectionToOutput.pin) !== undefined;

    if (exists) {
      return; // prevent from wiring two times to the same input
    }
    
    arrayToOutput.push(connectionToOutput);
    arrayFromInput.push(connectionFromOutput);
    IsWiring = false;

    autoSave();
  }
});

/* Drawing wires */


function GetPinCoord(pin) {

  const container = document.getElementById('board'); 
  const containerRect = container.getBoundingClientRect();
  
  const scaleX = container.offsetWidth / containerRect.width;
  const scaleY = container.offsetHeight / containerRect.height;

  offset = pin.offset();
  const posX = (offset.left - containerRect.left) * scaleX;
  const posY = (offset.top - containerRect.top) * scaleY;
  
  return {
    x: posX + pin.width() / 2,
    y: posY + pin.height() / 2
  };
}


function draw () {
    paper.width = paper.clientWidth;
    paper.height = paper.clientHeight;
    pen.lineWidth = 4;
    pen.clearRect(0, 0, paper.width, paper.height);


    if (IsWiring) {
      const container = document.getElementById('board'); 
      const containerRect = container.getBoundingClientRect();

      const scaleX = container.offsetWidth / containerRect.width;
      const scaleY = container.offsetHeight / containerRect.height;

      const end = {
        x: (WiringMouseCoords.x - containerRect.left) * scaleX,
        y: (WiringMouseCoords.y - containerRect.top) * scaleY
      };

      const WiringStartCoords = GetPinCoord($(`#${WiringStartComponent}`).find(`.${WiringStartPin}`));

      pen.strokeStyle = wireActive;
      pen.beginPath();
      pen.moveTo(WiringStartCoords.x, WiringStartCoords.y);
      pen.lineTo(end.x, end.y);
      pen.stroke();
    }


  
    for (const component in diagram) {
  
      for (const output in diagram[component].outputs) {
  
        const start = GetPinCoord($(`#${component}`).find(`.${output}`));
  
        const { state } = diagram[component].outputs[output];
        if (state === 1) {
          pen.strokeStyle = wireColorOn;
        } else {
          pen.strokeStyle = wireColorOff;
        }
  
        for (const input of diagram[component].outputs[output].to) {
  
          if ($(`#${input.component}`).length) { // check if end element exist
            const end = GetPinCoord($(`#${input.component}`).find(`.${input.pin}`));
  
            pen.beginPath();
            pen.moveTo(start.x, start.y);
            pen.lineTo(end.x, end.y);
            pen.stroke();
  
          }
        }
      }
    }
requestAnimationFrame(draw);
}
  
draw();