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

