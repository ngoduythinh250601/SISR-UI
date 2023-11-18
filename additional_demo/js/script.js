function displayImage(input) {
  // Get the <rect> and <text> elements
  var rect = document.getElementById('placeholder-rect');
  var text = document.getElementById('thumbnil');

  // Remove any existing patterns
  var existingPattern = document.getElementById('inputimage');
  if (existingPattern) {
      existingPattern.parentNode.removeChild(existingPattern);
  }

  // Get the selected file from the input
  var file = input.files[0];

  // Create a FileReader to read the selected file
  var reader = new FileReader();

  // Set up the FileReader to display the image when it's loaded
  reader.onload = function (e) {
      // Set the <rect> fill to the image
      rect.setAttribute('fill', 'url(#inputimage)');

      // Set the <text> content to be empty
      text.textContent = '';

      // Create a pattern element and an image element inside it
      var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', 'inputimage');
      pattern.setAttribute('width', '100%');
      pattern.setAttribute('height', '100%');

      var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('x', '0');
      image.setAttribute('y', '0');
      image.setAttribute('width', '100%');
      image.setAttribute('height', '100%');
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');

      // Set the image source to the data URL of the selected file
      image.setAttribute('href', e.target.result);

      // Append the image to the pattern, and the pattern to the SVG
      pattern.appendChild(image);
      rect.parentNode.appendChild(pattern);

      // Enable the buttons and set their styles
      var runButton = document.getElementById('upload');

      runButton.disabled = false;
      runButton.style.backgroundColor = ''; // Set the background color to default
      runButton.style.borderColor='';

  };

  // Read the selected file as a data URL
  reader.readAsDataURL(file);
}




/*slider-image*/
jQuery(document).ready(function($){
  var dragging = false,
      scrolling = false,
      resizing = false;
  //cache jQuery objects
  var imageComparisonContainers = $('.cd-image-container');
  //check if the .cd-image-container is in the viewport 
  //if yes, animate it
  checkPosition(imageComparisonContainers);
  $(window).on('scroll', function(){
      if( !scrolling) {
          scrolling =  true;
          ( !window.requestAnimationFrame )
              ? setTimeout(function(){checkPosition(imageComparisonContainers);}, 100)
              : requestAnimationFrame(function(){checkPosition(imageComparisonContainers);});
      }
  });
  
  //make the .cd-handle element draggable and modify .cd-resize-img width according to its position
  imageComparisonContainers.each(function(){
      var actual = $(this);
      drags(actual.find('.cd-handle'), actual.find('.cd-resize-img'), actual, actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-image-label[data-type="modified"]'));
  });

  //upadate images label visibility
  $(window).on('resize', function(){
      if( !resizing) {
          resizing =  true;
          ( !window.requestAnimationFrame )
              ? setTimeout(function(){checkLabel(imageComparisonContainers);}, 100)
              : requestAnimationFrame(function(){checkLabel(imageComparisonContainers);});
      }
  });

  function checkPosition(container) {
      container.each(function(){
          var actualContainer = $(this);
          if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
              actualContainer.addClass('is-visible');
          }
      });

      scrolling = false;
  }

  function checkLabel(container) {
      container.each(function(){
          var actual = $(this);
          updateLabel(actual.find('.cd-image-label[data-type="modified"]'), actual.find('.cd-resize-img'), 'left');
          updateLabel(actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-resize-img'), 'right');
      });

      resizing = false;
  }

  //draggable funtionality - credits to http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
  function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
      dragElement.on("mousedown vmousedown", function(e) {
          dragElement.addClass('draggable');
          resizeElement.addClass('resizable');

          var dragWidth = dragElement.outerWidth(),
              xPosition = dragElement.offset().left + dragWidth - e.pageX,
              containerOffset = container.offset().left,
              containerWidth = container.outerWidth(),
              minLeft = containerOffset + 10,
              maxLeft = containerOffset + containerWidth - dragWidth - 10;
          
          dragElement.parents().on("mousemove vmousemove", function(e) {
              if( !dragging) {
                  dragging =  true;
                  ( !window.requestAnimationFrame )
                      ? setTimeout(function(){animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);}, 100)
                      : requestAnimationFrame(function(){animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);});
              }
          }).on("mouseup vmouseup", function(e){
              dragElement.removeClass('draggable');
              resizeElement.removeClass('resizable');
          });
          e.preventDefault();
      }).on("mouseup vmouseup", function(e) {
          dragElement.removeClass('draggable');
          resizeElement.removeClass('resizable');
      });
  }

  function animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement) {
      var leftValue = e.pageX + xPosition - dragWidth;   
      //constrain the draggable element to move inside his container
      if(leftValue < minLeft ) {
          leftValue = minLeft;
      } else if ( leftValue > maxLeft) {
          leftValue = maxLeft;
      }

      var widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';
      
      $('.draggable').css('left', widthValue).on("mouseup vmouseup", function() {
          $(this).removeClass('draggable');
          resizeElement.removeClass('resizable');
      });

      $('.resizable').css('width', widthValue); 

      updateLabel(labelResizeElement, resizeElement, 'left');
      updateLabel(labelContainer, resizeElement, 'right');
      dragging =  false;
  }

  function updateLabel(label, resizeElement, position) {
      if(position == 'left') {
          ( label.offset().left + label.outerWidth() < resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
      } else {
          ( label.offset().left > resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
      }
  }
});


/* display full-image */
    








