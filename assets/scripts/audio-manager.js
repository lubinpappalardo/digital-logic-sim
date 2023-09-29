
function playAudio(audioName) {
    $(`<audio hidden autoplay><source src="assets/sfx/${audioName}.mp3" type="audio/mpeg">`).appendTo('body').delay(1000).queue(function(next) {
        $(this).remove();
        next();
    });;
}
