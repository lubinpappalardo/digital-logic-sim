let IsDraggingBoard = false;
let BoardDraggingStartCoordinates;
let BoardDraggingDistance;
let BoardLastDraggingDistance = {x: 0, y: 0};

/* --- BOARD ---- */

$('.board-container').on('mousedown', function (e) {
    if (!$(e.target).hasClass('component') && !IsWiring) {
      console.log(IsWiring);
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

/* touch */
$('.board-container').on('touchstart', function (e) {
  if (!$(e.target).hasClass('component') && !IsWiring) {
    IsDraggingBoard = true;
    const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    BoardDraggingStartCoordinates = {
      x: touch.pageX, 
      y: touch.pageY
    };

    if (BoardLastDraggingDistance === undefined) { /* don't know why but it doesn't work without it */
      BoardLastDraggingDistance = {x: 0, y: 0};
    }
  }
});
  
$(document).on('mouseup touchend', function (e) {
    IsDraggingBoard = false;
    BoardLastDraggingDistance = BoardDraggingDistance;
});

$(document).on('mousemove', function (e) {
  if (IsDraggingBoard && !IsWiring) {
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

/* touch */
$(document).on('touchmove', function (e) {
  if (IsDraggingBoard && !IsWiring) {
    const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    const x = touch.pageX;
    const y = touch.pageY;
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
  