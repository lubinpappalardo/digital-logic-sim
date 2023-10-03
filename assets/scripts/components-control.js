let IsDraggingComponent = false;
let DraggedComponent;
let SelectedComponent = '';
let SwitchHovered = '';
let componentRotations = {};

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
        if (SelectedComponent.hasClass('switch')) {
            $('#activateSwitchComponent').removeClass('ignored');
        } else {
            $('#activateSwitchComponent').addClass('ignored');
        }
      }
    }
});

$('#activateSwitchComponent').click(function (e) {
    activateSwitch(SelectedComponent);
})

$(document).dblclick('.component', function(e) {
    if (!$(e.target).hasClass('pin') && $(e.target).hasClass('switch')) {
        activateSwitch($(e.target));
    }
});

$(document).on('contextmenu', '.switch', function (e) {
    if (!$(e.target).hasClass('pin')) { // prevent switch to turn on if it's the pin who has been clicked
      activateSwitch($(this));
    }
});

  
/* unselect on click on void */
$('#board').on('click', function (e) {
    if (SelectedComponent !== '' && SelectedComponent.attr('id') !== $(e.target).attr('id')) {
        $('.selected').removeClass('selected');
        SelectedComponent = '';
    }
});

/* Adding new components */

$(document).on('click', '.add-component', function (e) {
    const gate = $(this).text().trim();
    const html = components[gate].replace('id=\'\'', `id='component${ComponentCount}'`);
    $('.components').append(html);

    let [x, y] = mousePositionToCoordinates($(window).width() / 2, $(window).height() / 2, $(`#component${ComponentCount}`));
    let isOverlap = true;

    // loop to prevent added component to overlap and stack on each others
    while (isOverlap) {
        isOverlap = false;
        for (const component in diagram) {
            // check if the position of the added component is close to an other one
            if (Math.abs(x - diagram[component].x) < 20 && Math.abs(y - diagram[component].y) < 20) {
                x += 75;
                y += 75;
                isOverlap = true;
            }
        }
    }
    $(`#component${ComponentCount}`).css('left', x + 'px');
    $(`#component${ComponentCount}`).css('top', y + 'px');

    ComponentCount += 1;
    setDiagram();
    autoSave();
});

/* Deleting components */

function deleteComponent() {
    const id = SelectedComponent.attr('id');
    delete diagram[id];
    SelectedComponent.remove();
    playAudio('cut.wav');
    setDiagram();
    autoSave();
};

/* Rotating components */

function rotateComponent() {
    const id = SelectedComponent.attr('id');
    let angle;
    // check if componentRotations[id] exist
    if (componentRotations[id] === undefined) {
        componentRotations[id] = 0;
        angle = 0;
    } else {
        angle = componentRotations[id];
    } 
    if (angle >= 360) {
        angle = 0;
    }
    angle += 90;
    componentRotations[id] = angle;
    SelectedComponent.find('.tooltip').css('transform', `translateY(120%) rotate(${360 - angle}deg)`);
    SelectedComponent.css('transform', `rotate(${angle}deg)`);
    diagram[id].rotation = angle;
    autoSave();
};


// keyboard shortcuts

$(document).keydown(function (e) {
    if (!keysDown[e.which]) {
        keysDown[e.which] = true;
        // Key pressed for the first time
        /* activate switch when enter key is pressed and mouse is over the component */
        if (e.which === 13 && SwitchHovered !== '') {
            activateSwitch(SwitchHovered);
        } else if (SelectedComponent !== '') {

            switch (e.which) {
                // rotate with r
                case 82: 
                    $('#rotateComponent').addClass('hover').delay(400).queue(function(next) {
                        $(this).removeClass('hover');
                        next();
                    });
                    rotateComponent();
                    break;
                // delete with backspace
                case 8:
                    $('#deleteComponent').addClass('hover').delay(400).queue(function(next) {
                        $(this).removeClass('hover');
                        next();
                    });
                    deleteComponent();
                    break;
                // activate switch with enter
                case 13:
                // check if the selected component is a switch
                    if (SelectedComponent.hasClass('switch')) {
                        activateSwitch(SelectedComponent);
                    }
                    break;
                default:
                break;
            }
        }
    }
});

// detect when switch is hovered
$(document).on('mouseover', '.switch', function () {
    SwitchHovered = $(this);
});

// detect when switch is not hovered
$(document).on('mouseout', '.switch', function () {
    SwitchHovered = '';
});

$(document).keyup(function (e) {
    keysDown[e.which] = false;
});


$(document).on('keydown', function (e) {
    if (SelectedComponent !== '') {
        let x, y;
        switch (e.which) {
        // on left arrow snap move left
        case 37:
            x = Number(SelectedComponent.css('left').slice(0, -2)) - 10;
            diagram[SelectedComponent.attr('id')].x = x;
            SelectedComponent.css('left', x + 'px');
            break;
        // on right arrow snap move right
        case 39:
            x = Number(SelectedComponent.css('left').slice(0, -2)) + 10;
            diagram[SelectedComponent.attr('id')].x = x;
            SelectedComponent.css('left', x + 'px');
            break;
        // on up arrow snap move up
        case 38:
            y = Number(SelectedComponent.css('top').slice(0, -2)) - 10;
            diagram[SelectedComponent.attr('id')].y = y;
            SelectedComponent.css('top', y + 'px');
            break;
        // on down arrow snap move down
        case 40:
            y = Number(SelectedComponent.css('top').slice(0, -2)) + 10;
            diagram[SelectedComponent.attr('id')].y = y;
            SelectedComponent.css('top', y + 'px');
            break;
        default:
            break;
        }
    }
});

/* Dragging components */

$(document).on('mousedown', '.component', function (e) {
    if (!$(e.target).hasClass('pin') && e.which === 1) {
        IsDraggingComponent = true;
        DraggedComponent = $(this);
    }
});

/* touch */
$(document).on('touchstart', '.component', function (e) {
    if (!$(e.target).hasClass('pin')) {
        IsDraggingComponent = true;
        DraggedComponent = $(this);
    }
});

$(document).on('mouseup touchend', '.component', function (e) {
    IsDraggingComponent = false;
    DraggedComponent = false;
    autoSave();
});


$(document).on('mousemove', function (e) {
    if (IsDraggingComponent) {
        const x = e.pageX;
        const y = e.pageY;

        const [posX, posY] = mousePositionToCoordinates(x, y, DraggedComponent);

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

/* touch */
$(document).on('touchmove', function (e) {
    if (IsDraggingComponent) {
        const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        const x = touch.pageX;
        const y = touch.pageY;

        const [posX, posY] = mousePositionToCoordinates(x, y, DraggedComponent);

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

function mousePositionToCoordinates(x, y, component) {
    const container = document.getElementById('board'); 
    const containerRect = container.getBoundingClientRect();
    const scaleX = container.offsetWidth / containerRect.width;
    const scaleY = container.offsetHeight / containerRect.height;
    let posX = (x - containerRect.left) * scaleX ;
    let posY = (y - containerRect.top) * scaleY;
    /* center */
    posX -= (component.width() / 2)
    posY -= (component.height() / 2)

    return [posX, posY];
}