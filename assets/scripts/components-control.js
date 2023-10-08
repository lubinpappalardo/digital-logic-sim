let IsDraggingComponent = false;
let DraggedComponent;
let SelectedComponent = '';
let SwitchHovered = '';
let componentRotations = {};
let IsDraggingNewComponent = false;

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
$(document).on('mousedown touchstart', '.add-component', function (e) {
    const gate = $(this).text().trim();
    const html = components[gate].replace('id=\'\'', `id='component${ComponentCount}'`);
    $('.components').append(html);

    DraggedComponent = $(`#component${ComponentCount}`);

    ComponentCount += 1;

    let x, y;
    if (e.type === 'touchstart') {
        const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        x = touch.pageX;
        y = touch.pageY;
    } else {
        x = e.pageX;
        y = e.pageY;
    }
    const [posX, posY] = mousePositionToCoordinates(x, y, DraggedComponent);
    IsDraggingNewComponent = true;
    DraggedComponent.css('left', posX + 'px');
    DraggedComponent.css('top', posY + 'px');
});


/* Deleting components */
function deleteComponent() {
    const id = SelectedComponent.attr('id');
    delete diagram[id];
    $(`#audio-${id}`).remove();
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

/* Dragging components */

$(document).on('mousedown touchstart', '.component', function (e) {
    if (!$(e.target).hasClass('pin')) {
        if (e.type === 'mousedown' && e.which !== 1) {
            return;
        }
        IsDraggingComponent = true;
        DraggedComponent = $(this);
    }
});

$(document).on('mouseup touchend', '.component', function (e) {
    IsDraggingComponent = false;
    if (IsDraggingNewComponent) {
        setDiagram();
    }
    IsDraggingNewComponent = false;
    DraggedComponent = false;
    autoSave();
});


$('#panel').on('mouseup touchend', function (e) {
    if (IsDraggingNewComponent) {
    // if element hasn't been dragged add it to middle;

        let [x, y] = mousePositionToCoordinates($(window).width() / 2, $(window).height() / 2, DraggedComponent);
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
        DraggedComponent.css('left', x + 'px');
        DraggedComponent.css('top', y + 'px');
        IsDraggingComponent = false;
        IsDraggingNewComponent = false;
        DraggedComponent = false;
        setDiagram();
        autoSave();
    }
})


$(document).on('mousemove touchmove', function (e) {
    if (IsDraggingComponent || IsDraggingNewComponent) {
        let x, y;
        if (e.type === 'mousemove') {
            x = e.pageX;
            y = e.pageY;
        } else {
            const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            x = touch.pageX;
            y = touch.pageY;
        }


        const [posX, posY] = mousePositionToCoordinates(x, y, DraggedComponent);

        if (posY > 0 && posY < BoardSize) {
            DraggedComponent.css('top', posY  + 'px');
            if (!IsDraggingNewComponent) {
                diagram[DraggedComponent.attr('id')].y = posY;
            }
        }
        if (posX > 0 && posX < BoardSize) {
            DraggedComponent.css('left', posX + 'px');
            if (!IsDraggingNewComponent) {
                diagram[DraggedComponent.attr('id')].x = posX;
            }
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