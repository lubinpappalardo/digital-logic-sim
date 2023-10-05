let clock;
let frequency;
let paused = false;

/* Logic */

/* Switches */
  
  function activateSwitch(switchComponent) {
    if (switchComponent.hasClass('on')) {
      switchComponent.removeClass('on');
      playAudio('switch-off.mp3');
    } else {
      switchComponent.addClass('on');
      playAudio('switch-on.mp3');
    }
    $('#activateSwitchComponent').addClass('hover').delay(400).queue(function(next) {
      $(this).removeClass('hover');
      next();
    });
  } 
  
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

  let lightAudioPlayed = {};
  
  function process() {
    for (const component in diagram) {
  
      if (diagram[component].type === 'LIGHT') {
        const inputs = Object.values(diagram[component].inputs).map(input => input.state);
        if (inputs.includes(1)) {
          $(`#${component}`).addClass('on');
          if (!lightAudioPlayed[component]) {
            playAudio('electricity.mp3', `audio-${component}`, true);
            lightAudioPlayed[component] = true;
          }
        } else {
          $(`#${component}`).removeClass('on');
          $(`#audio-${component}`).remove();
          lightAudioPlayed[component] = false;
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
          if (result === 1) {
            $(`#${component}`).find(`.${output}`).addClass('on');
          } else {
            $(`#${component}`).find(`.${output}`).removeClass('on');
          }
          
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
    const value = $('input[name="frequency"]:checked').val();
    $('#ClockFrequency').text(`${value} Hz  /  ${1000 / value} ms cycle`);
  
    clearInterval(clock);
    frequency = 1000 / value;
    if (!paused) {
      clock = setInterval(process, frequency);
    }
  }