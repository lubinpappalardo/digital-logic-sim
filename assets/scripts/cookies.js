// set a cookie
function closePopup() {
    // remove ths visible class then once the 1s animation is done remove the popup
    $(`#cookies-popup`).removeClass('visible').delay(1000).queue(function(next) {
        $(this).remove();
        next();
    });
    setCookie('popupSeen', 'true');
}

$(document).ready(function() {
    // Make a cookie popup appear
    console.log(getCookie('popupSeen'));
    if (getCookie('popupSeen') !== 'true') {
        const cookiesPopup = $(`
            <div id="cookies-popup">
                <span onclick="closePopup()" class="popup-close material-symbols-outlined">close</span>
                <h2><span class="cookie-icon material-symbols-outlined">cookie</span>Cookies</h2>
                <p>This website uses cookies to ensure you get the best experience on my website.</p>
            </div
        `);

        $('body').append(cookiesPopup);
        // Delay the addition of the visible class
        setTimeout(function() {
            cookiesPopup.addClass('visible');
        }, 100); // 100ms delay
    }
});