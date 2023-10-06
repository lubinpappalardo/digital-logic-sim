const panel = $('#panel');
const menuBtn = $('#menu-btn');
let isMobile;

function checkIsMobile() {
  if ($(window).width() < 768) {
    isMobile = true;
    menuBtn.addClass('close');
  } else {
    isMobile = false;
    panel.removeClass('closed');
    menuBtn.removeClass('close');
  }
}

checkIsMobile();


/* ---- ---- CSS & animations ---- ---- */

function openClearingConfirmation() {
  $('#clearing-confirmation').addClass('opened');
}

function closeClearingConfirmation() {
  $('#clearing-confirmation').removeClass('opened');
}


$('#pulseBtn').on('click', function() {
    $('#pulseBtn').addClass('animate-pulse').delay(500).queue(function(next) {
      $(this).removeClass('animate-pulse');
      next();
    });
});


menuBtn.click(function() {
  if (isMobile) {
    if (panel.hasClass('closed')) {
      panel.removeClass('closed');
      menuBtn.addClass('close');
    } else {
      panel.addClass('closed');
      menuBtn.removeClass('close');
    }
  }
});

$(window).resize(function() {
  checkIsMobile();
})


/* ---- ---- Page behavior ---- ---- */

$.fn.isInViewport = function () {
  const elementTop = $(this).offset().top;
  const elementBottom = elementTop + $(this).outerHeight();
  const viewportTop = $(window).scrollTop();
  const viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};


$('#panel').on('mousewheel DOMMouseScroll', function(e) {
  if (!isMobile) {
    return;
  }
  var e0 = e.originalEvent,
      delta = e0.wheelDelta || -e0.detail;

  this.scrollTop += (delta < 0 ? 1 : -1) * 30;
  e.preventDefault();
});


document.addEventListener('touchmove', function(ev) {
  if (!isMobile) {
    return;
  } 
  ev.preventDefault();
  ev.stopImmediatePropagation();
}, { passive: false });


document.addEventListener('mousewheel', function(ev) {
  if (!isMobile) {
    return;
  } 
  ev.preventDefault();
}, { passive: false });



let startY;
let lastY;
let momentum;

document.getElementById('panel').addEventListener('touchstart', function(e) {
    if (!isMobile) {
        return;
    }
    lastY = e.touches[0].clientY;
    startY = e.touches[0].clientY;
    momentum = 0;
}, false);

document.getElementById('panel').addEventListener('touchmove', function(e) {
    if (!isMobile) {
      return;
    }
    let touch = e.touches[0];
    let change = (startY - touch.clientY) * 0.9;

    document.getElementById('panel').scrollBy(0, change);
    startY = touch.clientY;

    momentum = (touch.clientY - lastY);
    lastY = touch.clientY;
}, false);

document.getElementById('panel').addEventListener('touchend', function(e) {
    if (!isMobile) {
      return;
    }
    function scroll() {
        if (Math.abs(momentum) > 0.1) {
            document.getElementById('panel').scrollBy(0, -momentum);
            momentum *= 0.95;  // Reduce the momentum over time
            requestAnimationFrame(scroll);
        }
    }
    scroll();  // Start the animation
}, false);


let pinchStartDist = 0;
let pinchEndDist = 0;
let isPinching = false;

$(document).on('touchstart', function(e) {
    if (e.originalEvent.touches.length === 2 && isMobile) {
        startDist = Math.hypot(
            e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX,
            e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY
        );
        isPinching = true;
    }
});

$(document).on('touchmove', function(e) {
    if (e.originalEvent.touches.length === 2 && isPinching) {
        endDist = Math.hypot(
            e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX,
            e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY
        );
        if (startDist > 50 && endDist > 50) {
          if (endDist > startDist) {
            ZoomIn();
          } else if (endDist < startDist) {
            ZoomOut();
          }
          startDist = endDist;
      }
    }
});

$(document).on('touchend', function(e) {
    if (isPinching) {
        startDist = 0;
        endDist = 0;
        isPinching = false;
    }
});