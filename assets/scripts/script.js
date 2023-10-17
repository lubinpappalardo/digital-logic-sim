const ignoredCookies = ['popupSeen']

const rootStyles = getComputedStyle(document.documentElement);

const BoardSize = Number(rootStyles.getPropertyValue('--boardSize').slice(0, -2));

let ComponentCount = 0;

let keysDown = {};

let diagram = {};


// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//    alert("Looks like your are using a mobile device ! Unfortunately, this website was designed for pc and laptop use only. Indeed, you won't be able to use it properly on your current device.");
// }


/* ---- DIAGRAM ---- */

function setDiagram() {
  
  $('.component').each(function() {
    const { id } = this;
    if (diagram[id] != undefined) {
      return;
    }
    
    const type = $(this).attr('class').split(' ')[1].toUpperCase();
    diagram[id] = {type: type, x: Number($(this).css('left').slice(0, -2)), y: Number($(this).css('top').slice(0, -2)), rotation: 0, inputs: {}, outputs: {}};
    // add an other key for text elements to store the value
    if (type === 'TEXT') {
      diagram[id].text = $(this).find('input').val();
    }

    // for each output pin
    $(this).find('.out-pins').find('.pin').each(function() {
      const name = $(this).attr('class').split(' ')[1];
      diagram[id].outputs[name] = {state: 0, to: []};
    });

    // for each input pin
    $(this).find('.in-pins').find('.pin').each(function() {
      const name = $(this).attr('class').split(' ')[1];
      diagram[id].inputs[name] = {state: 0, from: []};
    });
  
  });
}

setDiagram();



function clearBoard() {
  pen.clearRect(0, 0, paper.width, paper.height);
  $(".components").empty();
  diagram = {};
  ComponentCount = 0;
  $('#loadDiagram').val('');
  clearAllAudio();
  resetWorkspace();
  setDiagram();
  deleteCookies();
  closeClearingConfirmation();
}


/* save and load */

const isValid = (function() {
 const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
 const rg2 = /^\./; // cannot start with dot (.)
 const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
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
  
  const blob = new Blob([content], { type: 'application/json' });
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
      const filename = $('#loadDiagram').val().split('\\').pop().slice(0, -5);
      $('#filename').val(filename);
    }
  }
});

$('#loadfile-btn').on('click', function(e) {
  $('#loadDiagram').click();
});

/* Loading */
$('#loadDiagram').on('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const content = e.target.result;
    const JsonData = JSON.parse(content);

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
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (ignoredCookies.includes(cookie.split('=')[0])) {
      continue;
    }
    const cookieName = cookie.split("=")[0];
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
}

function deleteCookie(cookieName) {
  // get the cookie with name = cookieName and delete it
  document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
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
  const cookies = document.cookie.split(";"); // Get all cookies

  let cookieValues = []; // Array to store cookie values

  // loop through all cookies
  for (let i = 0; i < cookies.length; i++) {
    
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }

    // make sure the cookie key isn't in the ignored list
    if (ignoredCookies.includes(cookie.split('=')[0])) {
      continue;
    }

    const cookieValue = cookie.split("=")[1]; // Get cookie value
    cookieValues.push(cookieValue); // Append value to array
  }

  return cookieValues;
}


// autosave work
function autoSave() {

  // reset cookies
  deleteCookies();

  const saves = getAllCookies();
  $('#board-saved').addClass('opened').delay(1000).queue(function(next) {
    $(this).removeClass('opened');
    next();
  });
  const str = JSON.stringify(diagram);
  let chunks = [];
  for (let i = 0; i < str.length; i += 2500) {
    chunks.push(str.substr(i, 2500));
  }
  // delete cookies whose index (saveN with 'N' the index) is above the number of chunks
  for (let i = chunks.length; i < getAllCookies().length; i++) {
    deleteCookie(`save ${i}`);
  }
  for (let i = 0; i < chunks.length; i++) {
    setCookie(`save ${i}`, chunks[i]);
  }
}


$(document).ready(function() {

  const autosave = getAllCookies().join("");
  
  if (autosave === "") { return; }

  try {
    JsonData = JSON.parse(autosave);
  } catch (e) {
    console.log(e);
    return;
  }
  
  if (Object.keys(JsonData).length === 0) { return; }  
  
  loadDiagram(JsonData);
});


function loadDiagram(JsonData) {

  if (!paused) { // pause the clock while everything is loading
    pauseClock();
  }
  
  clearBoard();

  for (const component in JsonData) {
    const { type } = JsonData[component];
    const html = components[type].replace('id=\'\'', `id='${component}'`);
    $('.components').append(html);
    $(`#${component}`).css('left', JsonData[component].x)
    $(`#${component}`).css('top', JsonData[component].y)
    $(`#${component}`).css('rotate', `${JsonData[component].rotation}deg`);
    if (type === 'TEXT') { // set stored text value for text elements
      $(`#${component} input`).val(JsonData[component].text);
    }
    ComponentCount = component;
  }

  diagram = JsonData;
  
  const numberStr = ComponentCount.replace(/[^\d]/g, '');
  const number = parseInt(numberStr);
  ComponentCount = number + 1;

  if (paused) {
    pauseClock();
  } // resume the clock

  autoSave();
}