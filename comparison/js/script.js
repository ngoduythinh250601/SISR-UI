const host_name = "http://127.0.0.1:5000";

$('.tile')
    // tile mouse actions
    .on('mouseover', function () {
        $(this).children('.photo').css({ 'transform': 'scale(' + $(this).attr('data-scale') + ')' });
    })
    .on('mouseout', function () {
        $(this).children('.photo').css({ 'transform': 'scale(1)' });
    })
    .on('mousemove', function (e) {
        $(this).children('.photo').css({ 'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 + '%' });
    })
    // tiles set up
    .each(function () {
        $(this)
            // add a photo container
            .append('<div class="photo"></div>')
            // some text just to show zoom level on current item in this example
            .children('.photo').css({ 'background-image': 'url(' + $(this).attr('data-image') + ')' });
    });