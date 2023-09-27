let IsDraggingBoard = false;
let BoardDraggingStartCoordinates;
let BoardDraggingDistance;
let BoardLastDraggingDistance = {x: 0, y: 0};

let IsDraggingComponent = false;
let DraggedComponent;

let WiringStartPin;
let WiringStartComponent;
let WiringEndPin;
let WiringEndComponent;
let IsWiring = false;

let clock;
let frequency;
let paused = false;

const rootStyles = getComputedStyle(document.documentElement);
const wireColorOff = rootStyles.getPropertyValue('--discreettext');
const wireColorOn = rootStyles.getPropertyValue('--primary');

const BoardSize = Number(rootStyles.getPropertyValue('--boardSize').slice(0, -2));

let ComponentCount = 0;

let SelectedComponent = '';

const components = {
  LIGHT: `
<div class='component light' id=''>
  <div class='in-pins'>
      <span class='pin input'></span>
  </div>
</div> 
  `,
  SWITCH: `
<div class='component switch' id=''>
  <div class='out-pins'>
      <span class='pin output'></span>
  </div>
</div> 
  `,
  BUFFER: `
<div class='component buffer' id=''>
  <div class='tooltip'>BUFFER</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  NOT: `
<div class='component not' id=''>
  <div class='tooltip'>NOT</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  AND: `
<div class='component and' id=''>
  <div class='tooltip'>AND</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
      <span class='pin input2'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  NAND: `
<div class='component nand' id=''>
  <div class='tooltip'>NAND</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
      <span class='pin input2'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  OR: `
<div class='component or' id=''>
  <div class='tooltip'>OR</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
      <span class='pin input2'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  NOR: `
<div class='component nor' id=''>
  <div class='tooltip'>NOR</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
      <span class='pin input2'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  XOR: `
<div class='component xor' id=''>
  <div class='tooltip'>XOR</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
      <span class='pin input2'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
  XNOR: `
<div class='component xnor' id=''>
  <div class='tooltip'>XNOR</div>
  <div class='in-pins'>
      <span class='pin input1'></span>
      <span class='pin input2'></span>
  </div>
  <div class='out-pins'>
      <span class='pin output1'></span>
  </div>
</div>
  `,
}

let diagram = {};



if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
   alert("Looks like your are using a mobile device ! Unfortunately, this website was designed for pc and laptop use only. Indeed, you won't be able to use it properly on your current device.");
}


/* --- BOARD ---- */

$('.board-container').on('mousedown', function (e) {
  if (!$(e.target).hasClass('component')) {
    IsDraggingBoard = true;
    BoardDraggingStartCoordinates = {
      x: e.pageX, 
      y: e.pageY
    };

    if (BoardLastDraggingDistance === undefined) { /* don't know why but it doesn't work without it */
      BoardLastDraggingDistance = {x: 0, y: 0};
    }
  }
});

$(document).on('mouseup', function (e) {
    IsDraggingBoard = false;
    BoardLastDraggingDistance = BoardDraggingDistance;
});

$(document).on('mousemove', function (e) {
  if (IsDraggingBoard) {
    const x = e.pageX;
    const y = e.pageY;
    const distanceX = x - BoardDraggingStartCoordinates.x;
    const distanceY = y - BoardDraggingStartCoordinates.y;
    BoardDraggingDistance = {
      x: BoardLastDraggingDistance.x + distanceX, 
      y: BoardLastDraggingDistance.y + distanceY, 
    }
    $('.board-container').css('transform', `translate(${BoardDraggingDistance.x}px, ${BoardDraggingDistance.y}px)`);
  }
});

/* zooming */

const ZoomSensivity = 0.1;
let scale = 1;

function ZoomIn() {
  scale = parseFloat($('.board-container').css('scale'));
  scale += ZoomSensivity;
  scale = Math.round(scale * 10) / 10; // Round to 1 decimal after point
  if (scale > 0.2 && scale < 4) {
    $('.board-container').css('scale', `${scale}`);
  }
}

function ZoomOut() {
  scale = parseFloat($('.board-container').css('scale'));
  scale -= ZoomSensivity;
  scale = Math.round(scale * 10) / 10; // Round to 1 decimal after point
  if (scale > 0.2 && scale < 4) {
    $('.board-container').css('scale', `${scale}`);
  }
}

$('.board-container').on('wheel', function(e) {
  if (e.originalEvent.deltaY > 0) {
    /* going down */
    ZoomOut();
  } else {
    /* going up */
    ZoomIn();
  }
});

function resetWorkspace() {
  BoardLastDraggingDistance = {x: 0, y: 0};
  $('.board-container').css('transform', 'translate(0px, 0px)');
  $('.board-container').css('scale', '1');
}



/* ---- DIAGRAM ---- */

function setDiagram() {
  
  $('.component').each(function() {
    const { id } = this;
    if (diagram[id] != undefined) {
      return;
    }
    
    const type = $(this).attr('class').split(' ')[1].toUpperCase();
    diagram[id] = {type: type, x: 0, y: 0, rotation: 0, inputs: {}, outputs: {}};

    // for each output pin
    $(this).find('.out-pins').find('.pin').each(function() {
      var name = $(this).attr('class').split(' ')[1];
      diagram[id].outputs[name] = {state: 0, to: []};
    });

    // for each input pin
    $(this).find('.in-pins').find('.pin').each(function() {
      var name = $(this).attr('class').split(' ')[1];
      diagram[id].inputs[name] = {state: 0, from: []};
    });
  
  });
}

setDiagram();



/* ---- COMPONENT --- */

/* Component selection */

$(document).on('mousedown', '.component', function (e) {
  if (e.which === 1) { /* make sure it's not right-click */
    if ($(this).hasClass('selected')) {
      $('.selected').removeClass('selected');
      SelectedComponent = '';
    } else {
      $('.selected').removeClass('selected');
      $(this).addClass('selected');
      SelectedComponent = $(this);
    }
  }
});

/* unselect on click on void */
$('#board').on('click', function (e) {
  if (SelectedComponent !== '') {
    if (SelectedComponent.attr('id') !== $(e.target).attr('id')) {
      $('.selected').removeClass('selected');
      SelectedComponent === '';
    }
  }
});

/* Adding new components */

$(document).on('click', '.add-component', function (e) {
  const gate = $(this).text().trim();
  const html = components[gate].replace('id=\'\'', `id='component${ComponentCount}'`);
  $('.components').append(html);
  ComponentCount += 1;

  setDiagram();
  autoSave();
});

/* Deleting components */

function deleteComponent() {
  const id = SelectedComponent.attr('id');
  delete diagram[id];
  SelectedComponent.remove();
  setDiagram();
  autoSave();
};


/* Rotating components */

function rotateComponent() {
  const id = SelectedComponent.attr('id');
  let angle = Number(SelectedComponent.css('rotate').slice(0, -3));
  if (angle === 360) {
    angle = 0;
  }
  SelectedComponent.css('rotate', `${angle + 90}deg`);
  diagram[id].rotation = angle + 90;
  autoSave();
};


/* Dragging components */

$(document).on('mousedown', '.component', function (e) {
  if (!$(e.target).hasClass('pin') && e.which === 1) {
    IsDraggingComponent = true;
    DraggedComponent = $(this);
  }
});

$(document).on('mouseup', '.component', function (e) {
  IsDraggingComponent = false;
  DraggedComponent = false;
  autoSave();
});


$(document).on('mousemove', function (e) {
  if (IsDraggingComponent) {

    const container = document.getElementById('board'); 

    var x = e.pageX;
    var y = e.pageY;
    var containerRect = container.getBoundingClientRect();
    var scaleX = container.offsetWidth / containerRect.width;
    var scaleY = container.offsetHeight / containerRect.height;
    var posX = (x - containerRect.left) * scaleX ;
    var posY = (y - containerRect.top) * scaleY;
    /* center */
    posX = posX - (DraggedComponent.width() / 2)
    posY = posY - (DraggedComponent.height() / 2)

    if (posY > 0 && posY < BoardSize) {
      DraggedComponent.css('top', posY  + 'px');
      diagram[DraggedComponent.attr('id')].y = posY;
    }
    if (posX > 0 && posX < BoardSize) {
      DraggedComponent.css('left', posX + 'px');
      diagram[DraggedComponent.attr('id')].x = posX;
    }
    
  }
});



/* ---- WIRING ---- */

$(document).on('click', '.out-pins', function (e) {
  if (!IsWiring) {
    if ($(e.target).hasClass('pin')) {
      WiringStartPin = $(e.target).attr('class').split(' ')[1];
      WiringStartComponent = $(e.target).parent().parent().attr('id');
      IsWiring = true;
    }
  } 
});

$(document).on('click', function (e) {
  if (IsWiring) {
    if (!$(e.target).hasClass('pin')) {
      IsWiring = false;
    }
  } 
});

$(document).on('click', '.in-pins', function (e) {
  if (IsWiring) {
    if ($(e.target).hasClass('pin')) {
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
  } 
});


/* Drawing wires */

const paper = document.getElementById("wires");
const pen = paper.getContext("2d");


function GetPinCoord(pin) {

  const container = document.getElementById('board'); 
  var containerRect = container.getBoundingClientRect();
  
  var scaleX = container.offsetWidth / containerRect.width;
  var scaleY = container.offsetHeight / containerRect.height;

  offset = pin.offset();
  var posX = (offset.left - containerRect.left) * scaleX;
  var posY = (offset.top - containerRect.top) * scaleY;
  
  const coord = {
    x: posX + pin.width() / 2,
    y: posY + pin.height() / 2
  }
  return coord;
}

function openClearingConfirmation() {
  $('#clearing-confirmation').addClass('opened');
}

function closeClearingConfirmation() {
  $('#clearing-confirmation').removeClass('opened');
}

function clearBoard() {
  pen.clearRect(0, 0, paper.width, paper.height);
  $(".components").empty();
  diagram = {};
  ComponentCount = 0;
  $('#loadDiagram').val('');
  setDiagram();
  deleteCookies();
  closeClearingConfirmation();
}


function draw () {
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;
  pen.lineWidth = 3;
  pen.clearRect(0, 0, paper.width, paper.height);

  for (const component in diagram) {

    for (const output in diagram[component].outputs) {

      const start = GetPinCoord($(`#${component}`).find(`.${output}`));

      const state = diagram[component].outputs[output].state;
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


/* save and load */

var isValid = (function() {
 var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
 var rg2 = /^\./; // cannot start with dot (.)
 var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
 return function isValid(fname) {
   return rg1.test(fname) && !rg2.test(fname) && !rg3.test(fname);
 };
})();


$('#filename').on('input', function(e) {
  
  const value = $('#filename').val();
  if (isValid(value)) {
    $('#filename').removeClass('not-valid');
    return;
  } else {
    $('#filename').addClass('not-valid');
  }
  
});


function save() {

  if (Object.keys(diagram).length === 0) {
    alert("Cannot save an empty board !");
    return;
  }
  
  const jsonData = JSON.stringify(diagram);

  const name = $('#filename').val();
  
  if (!isValid(name)) {
    alert('Project name not valid. Name has to be valid for file naming (forbidden characters \\ / : * ? " < > |)."')
    return;
  }
  const filename = `${name}.json`;
  const content = jsonData;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up the URL object to free memory
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    link.remove();
  }, 0);

}

$('#loadDiagram').on('change', function(e) {
  
  if ($('#loadDiagram').prop('files').length > 0) {
    
    if ($('#loadDiagram').prop('files').length > 1) {
      $('#loadDiagram').val('');
      alert('Only 1 file can be accepted !');
    } else {
      var filename = $('#loadDiagram').val().split('\\').pop().slice(0, -5);
      $('#filename').val(filename);
    }
  }
});

$('#loadfile-btn').on('click', function(e) {
  $('#loadDiagram').click();
});

/* Loading */
$('#loadDiagram').on('change', function(e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  
  reader.onload = function(e) {
    var content = e.target.result;
    var JsonData = JSON.parse(content);

    loadDiagram(JsonData);
  };

  reader.readAsText(file);
});


// set a cookie
function setCookie(cname, cvalue) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function deleteCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    var cookieName = cookie.split("=")[0];
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
}

// get a cookie
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getAllCookies() {
  var cookies = document.cookie.split(";"); // Get all cookies

  var cookieValues = []; // Array to store cookie values

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    var cookieValue = cookie.split("=")[1]; // Get cookie value
    cookieValues.push(cookieValue); // Append value to array
  }

  return cookieValues;
}


function autoSave() {
  $('#board-saved').addClass('opened').delay(1000).queue(function(next) {
    $(this).removeClass('opened');
    next();
  });
  var str = JSON.stringify(diagram);
  var chunks = [];
  for (var i = 0; i < str.length; i += 2500) {
    chunks.push(str.substr(i, 2500));
  }
  for (let i = 0; i < chunks.length; i++) {
    setCookie(`save ${i}`, chunks[i]);
  }
}


$(document).ready(function() {

  var autosave = getAllCookies().join("");
  
  if (autosave === "") { return; }
  
  JsonData = JSON.parse(autosave);
  
  if (Object.keys(JsonData).length === 0) { return; }  
  
  loadDiagram(JsonData);
});


function loadDiagram(JsonData) {

  if (!paused) {
    pauseClock();
  }
  
  clearBoard();

  for (const component in JsonData) {
    const type = JsonData[component].type;
    const html = components[type].replace('id=\'\'', `id='${component}'`);
    $('.components').append(html);
    $(`#${component}`).css('left', JsonData[component].x)
    $(`#${component}`).css('top', JsonData[component].y)
    $(`#${component}`).css('rotate', `${JsonData[component].rotation}deg`);
    ComponentCount = component;
  }

  diagram = JsonData;
  
  var numberStr = ComponentCount.replace(/[^\d]/g, '');
  var number = parseInt(numberStr);
  ComponentCount = number + 1;

  if (paused) {
    pauseClock();
  }

  autoSave();
}


/* Logic */

/* Switches */
$(document).on('contextmenu', '.switch', function (e) {
  if (!$(e.target).hasClass('pin')) { // prevent switch to turn on if it's the pin who has been clicked

    if ($(this).hasClass('on')) {
      $(this).removeClass('on');
    } else {
      $(this).addClass('on');
    }
    
  }

});

function BUFFER(a) {
  return a;
}

function NOT(a) {
  if (a == 1) {
    return 0;
  }
  return 1;
}

function AND(a, b) {
  return a && b ? 1 : 0;
}

function NAND(a, b) {
  return a && b ? 0 : 1;
}

function OR(a, b) {
  return a || b ? 1 : 0;
}

function NOR(a, b) {
  return a || b ? 0 : 1;
}

function XOR(a, b) {
  return a ^ b ? 1 : 0;
}

function XNOR(a, b) {
  return a ^ b ? 0 : 1;
}

function process() {
  for (const component in diagram) {

    if (diagram[component].type === 'LIGHT') {
      const inputs = Object.values(diagram[component].inputs).map(input => input.state);
      if (inputs.includes(1)) {
        $(`#${component}`).addClass('on');
      } else {
        $(`#${component}`).removeClass('on');
      }
    }

    if (diagram[component].type === 'SWITCH') {

        if ($(`#${component}`).hasClass('on')) {
          diagram[component].outputs.output.state = 1;
        } else {
          diagram[component].outputs.output.state = 0;
        }
          
        result = diagram[component].outputs.output.state;
        // set the input state of the linked component to the result
        for (const input of diagram[component].outputs.output.to) {
  
          if ($(`#${input.component}`).length) { // check if end element exist else delete it from diagram
            diagram[input.component].inputs[input.pin].state = result;
          } else {
            const arrayOutput = diagram[component].outputs.output.to;
            const indexOutput = arrayOutput.indexOf(input);
            arrayOutput.splice(indexOutput, 1);
          }
          
        }
      
    } else {

      for (const output in diagram[component].outputs) {
        
        const inputs = Object.values(diagram[component].inputs).map(input => input.state);
        const result = window[diagram[component].type](...inputs);
        // set the output state to the result
        diagram[component].outputs[output].state = result;
        
        // set the input state of the linked component to the result
        for (const input of diagram[component].outputs[output].to) {
  
          if ($(`#${input.component}`).length) { // check if end element exist else delete it from diagram
            diagram[input.component].inputs[input.pin].state = result;
          } else {
            const arrayOutput = diagram[component].outputs[output].to;
            const indexOutput = arrayOutput.indexOf(input);
            arrayOutput.splice(indexOutput, 1);
          }
          
        }
      }
    }
  }
}

changeFrequency();

function pauseClock() {
  if (paused) {
    clock = setInterval(process, frequency);
    $('#pauseBtn').find('.google-icon').text('stop');
    $('#pauseBtn').find('.stop-play-alt').text('Stop');
    paused = false;
  } else {
    clearInterval(clock);
    $('#pauseBtn').find('.google-icon').text('play_arrow');
    $('#pauseBtn').find('.stop-play-alt').text('Play');
    paused = true;
  }
}

function changeFrequency() {
  var value = $('input[name="frequency"]:checked').val();
  $('#ClockFrequency').text(`${value} Hz  /  ${1000 / value} ms cycle`);

  clearInterval(clock);
  frequency = 1000 / value;
  if (!paused) {
    clock = setInterval(process, frequency);
  }
}



/* ---- ---- CSS & animations ---- ---- */

$('#pulseBtn').on('click', function() {
  $('#pulseBtn').addClass('animate-pulse').delay(500).queue(function(next) {
    $(this).removeClass('animate-pulse');
    next();
  });
})