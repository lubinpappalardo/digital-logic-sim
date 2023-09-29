
function playAudio(audioName, id='', loop=false) {
    // audio manager
    if (loop) {
        $(`<audio id='${id}' hidden autoplay loop><source src="assets/sfx/${audioName}" type="audio/mpeg">`).appendTo('body');
    } else {
        $(`<audio id='${id}' hidden autoplay><source src="assets/sfx/${audioName}" type="audio/mpeg">`).appendTo('body').delay(3000).queue(function(next) {
            $(this).remove();
            next();
        });;
    }

}
