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