function downloadImages() {
    // Array of image IDs
    var imageIds = ['downloadImage1', 'downloadImage2']; // Add more IDs as needed

    // Loop through each image
    imageIds.forEach(function (id) {
        // Get the image element
        var image = document.getElementById(id);

        // Create a canvas element
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the image on the canvas
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        // Convert the canvas content to a data URL
        var dataUrl = canvas.toDataURL('image/png');

        // Create a temporary link element
        var link = document.createElement('a');

        // Set the href attribute of the link to the data URL
        link.href = dataUrl;

        // Set the download attribute with the desired file name
        link.download = 'downloaded_image_' + id + '.png';

        // Append the link to the document
        document.body.appendChild(link);

        // Trigger a click event on the link to start the download
        link.click();

        // Remove the link from the document
        document.body.removeChild(link);
    });
}