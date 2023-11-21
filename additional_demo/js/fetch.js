// ----- init state -------
const host_name = "https://e4f5-42-118-228-189.ngrok-free.app";

const listGroupCheckableUpscalesX4 = document.getElementById("listGroupCheckableUpscales1");
const listGroupCheckableUpscalesX8 = document.getElementById("listGroupCheckableUpscales2");
const listGroupCheckableVNLandscapeModel = document.getElementById("listGroupCheckableModels1");
const listGroupCheckableHumanFacesModel = document.getElementById("listGroupCheckableModels2");
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
const loadingSpinner = document.getElementById("loading");
const imageFile = document.getElementById("image-file");
const uploadBtn = document.getElementById("upload");
const downloadBtn = document.getElementById("download");
const textModelName = document.getElementById("modelNameDisplay");


var scale = "SRx4";
var modelName = 'HAT-S_for_VietnamLandscape';
var ymlFileName = 'HAT-S_SRx4_for_VietnamLandscape';
var blobFile;
let startTime;
let endTime;

const dict_modelName = {
    "HAT-S_for_VietnamLandscape": 'HAT-S for Vietnam Landscape',
    "HAT-S_denoise_HumanFaces": "HAT-S denoise Human Faces",
};
const dict_upscale = {
    "SRx4": 'upscale x4',
    "SRx8": "upscale x8"
};
textModelName.textContent = "Model name: " + dict_modelName[modelName] + ", " + dict_upscale[scale];


// ----- function state -------

function showSpinner(optionId) {
    var loadingSpinner = document.getElementById(optionId);
    loadingSpinner.style.display = 'block';
};

function hideSpinner(optionId) {
    var loadingSpinner = document.getElementById(optionId);
    loadingSpinner.style.display = 'none';
};

function updateYmlFileName() {
    ymlFileName = "HAT-S_" + scale + modelName.substring(5);
    textModelName.textContent = "Model name: " + dict_modelName[modelName] + ", " + dict_upscale[scale];
    console.log("update YAML file name:", ymlFileName);
};

function updateScale() {
    if (listGroupCheckableUpscalesX4.checked) {
        scale = "SRx4";
    } else if (listGroupCheckableUpscalesX8.checked) {
        scale = "SRx8";
    }
    console.log("update upscale option:", scale);
    updateYmlFileName();
};
listGroupCheckableUpscalesX4.addEventListener('change', updateScale);
listGroupCheckableUpscalesX8.addEventListener('change', updateScale);

function updateModelName() {
    if (listGroupCheckableVNLandscapeModel.checked) {
        modelName = "HAT-S_for_VietnamLandscape";
    } else if (listGroupCheckableHumanFacesModel.checked) {
        modelName = "HAT-S_denoise_HumanFaces";
    }
    console.log("update model name:", modelName);
    updateYmlFileName();
};
listGroupCheckableVNLandscapeModel.addEventListener('change', updateModelName);
listGroupCheckableHumanFacesModel.addEventListener('change', updateModelName);

const alert = (message, type) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');
    if (alertPlaceholder.firstChild) {
        alertPlaceholder.insertBefore(wrapper, alertPlaceholder.firstChild);
    }
    else {
        alertPlaceholder.append(wrapper);
    };
};

// Sample usage after processing
// Replace this with your actual processing logic
setTimeout(function () {
    var resultBlob = new Blob(); // Replace this with your actual processed result blob
    displayProcessedResult(resultBlob);
}, 5000); // Simulating a delay before displaying the result
function displaySRImage(file) {
    var rect = document.getElementById('SRImage-rect');
    var text = document.getElementById('SRImage-text');

    // Remove any existing patterns
    var existingPattern = document.getElementById('outputimage');
    if (existingPattern) {
        existingPattern.parentNode.removeChild(existingPattern);
    }

    // Create a FileReader to read the selected file
    var reader = new FileReader();

    // Set up the FileReader to display the image when it's loaded
    reader.onload = function (e) {
        rect.setAttribute('fill', 'url(#outputimage)');
        text.textContent = '';

        // Create a pattern element and an image element inside it
        var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'outputimage');
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

    };

    // Read the selected file as a data URL
    reader.readAsDataURL(file);
};

uploadBtn.addEventListener("click", e => {
    // Hiển thị biểu tượng quay khi bắt đầu xử lý
    hideProcessingTime();
    showSpinner('waiting_spinner');
    e.preventDefault();
    // Ghi lại thời điểm bắt đầu
    startTime = new Date();

    const formData = new FormData();
    console.log(imageFile.files[0]);
    formData.append("image", imageFile.files[0]);
    formData.append("model_name", ymlFileName);
    var requestOptions = {
        method: 'POST',
        headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
        }),
        body: formData,
    };
    displayWaitingStatus();
    fetch(host_name + '/upload', requestOptions)
        .then(response => {
            let contentType = response.headers.get('Content-Type');
            if (contentType.includes('application/json')) {
                response.json().then(data => {
                    console.log(data);
                    hideSpinner('waiting_spinner');
                    hideWaitingStatus();
                    alert(data['msg'], 'warning');
                });
            } else if (contentType.includes('image/png')) {
                response.blob().then(blob => {
                    displaySRImage(blob);
                    blobFile = blob;
                    endTime = new Date();

                    hideSpinner('waiting_spinner');
                    hideWaitingStatus();
                    displayProcessingTime();

                    downloadBtn.disabled = false;
                    downloadBtn.style.borderColor = '';
                    downloadBtn.style.color = '';
                    downloadBtn.style.backgroundColor = '';
                });
            } else {
                alert('Unsupported data type!', 'warning');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            hideSpinner('waiting_spinner');
            hideWaitingStatus();
            alert('Fetch error!', 'warning');
        });
});

function displayWaitingStatus() {
    const waitingstatus = document.getElementById('waitingstatus');
    waitingstatus.innerHTML = `Waiting...`;
};

function hideWaitingStatus() {
    const waitingstatus = document.getElementById('waitingstatus');
    waitingstatus.innerHTML = ``;

};

function displayWaitingStatusfeedback() {
    const waitingstatusfeedback = document.getElementById('waitingstatusfeedback');
    waitingstatusfeedback.innerHTML = `Waiting...`;
};

function hideWaitingStatusfeedback() {
    const waitingstatusfeedback = document.getElementById('waitingstatusfeedback');
    waitingstatusfeedback.innerHTML = ``;

};

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;

    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

function submitFeedback() {
    const feedbackText = document.getElementById('feedback').value;
    hideResponseFeedback();
    showSpinner("waiting_spinner_feedback");
    displayWaitingStatusfeedback();
    if (feedbackText.trim() === '') {
        return;
    }
    console.log(feedbackText);
    const formData = new FormData();
    formData.append("feedback", feedbackText);
    var requestOptions = {
        method: 'POST',
        headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
        }),
        body: formData,
    };
    fetch(host_name + '/feedback', requestOptions)
        .then(response => {
            hideWaitingStatusfeedback();
            hideSpinner('waiting_spinner_feedback');
            let contentType = response.headers.get('Content-Type');
            if (contentType.includes('application/json')) {
                response.json().then(data => {
                    console.log(data);
                    if (data['status'] == 'success')
                        displayResponseFeedback("Thank you!");
                    if (data['status'] == 'failed')
                        displayResponseFeedback(data['msg']);
                });
            } else {
                displayResponseFeedback("Unsupported data type!");
            }
        })
        .catch(error => {
            displayResponseFeedback('Fetch error!');
            hideSpinner('waiting_spinner_feedback');
            hideWaitingStatusfeedback();
        });
};

downloadBtn.addEventListener("click", e => {
    e.preventDefault();

    var imageUrl = URL.createObjectURL(blobFile);
    console.log(imageUrl);
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = 'SR-image.png';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
});

function displayProcessingTime() {
    // Tính thời gian chênh lệch
    const processingTime = endTime - startTime;

    // Chuyển đổi thời gian thành giây (hoặc một đơn vị thời gian khác nếu cần)
    const processingTimeInSeconds = processingTime / 1000;

    // Hiển thị thời gian vào div
    const processingTimeDiv = document.getElementById('processingTime');
    processingTimeDiv.innerHTML = `Processing Time: ${processingTimeInSeconds.toFixed(2)} seconds`;
};

function hideProcessingTime() {
    const processingTimeDiv = document.getElementById('processingTime');
    processingTimeDiv.innerHTML = ``;
};

function displayResponseFeedback(text) {
    // Hiển thị thời gian vào div
    const feedbackResponse = document.getElementById('feedbackResponse');
    feedbackResponse.innerHTML = text;
};
function hideResponseFeedback() {
    const feedbackResponse = document.getElementById('feedbackResponse');
    feedbackResponse.innerHTML = ``;
};

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
        runButton.style.borderColor = '';

    };

    // Read the selected file as a data URL
    reader.readAsDataURL(file);
};