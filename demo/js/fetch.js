// ----- init state -------
const host_name = " https://8f13-42-118-228-189.ngrok-free.app/";

const listGroupCheckableUpscalesX4 = document.getElementById("listGroupCheckableUpscales1");
const listGroupCheckableUpscalesX8 = document.getElementById("listGroupCheckableUpscales2");
const listGroupCheckableOriginalModel = document.getElementById("listGroupCheckableModels1");
const listGroupCheckableMosaicModel = document.getElementById("listGroupCheckableModels2");
const listGroupCheckablePerceptualLossModel = document.getElementById("listGroupCheckableModels3");
const listGroupCheckableMixLossesModel = document.getElementById("listGroupCheckableModels4");
const loadingSpinner = document.getElementById("loading");
const imageFile = document.getElementById("image-file");
const uploadBtn = document.getElementById("upload");
const downloadBtn = document.getElementById("download");
const textModelName = document.getElementById("modelNameDisplay");


var scale = "SRx4";
var modelName = 'HAT-S_from_scratch';
var ymlFileName = 'HAT-S_SRx4_from_scratch';
var blobFile;
let startTime;
let endTime;

const dict_modelName = {
    "HAT-S_from_scratch": 'HAT-S',
    "HAT-S_Patch-Mosaic": "HAT-S with Patch-Mosaic",
    "HAT-S_PerceptualLoss_conv2_2": "HAT-S with Perceptual Loss",
    "HAT-S_MixLosses": "HAT-S with MixLosses Loss"
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
}

function hideSpinner(optionId) {
    var loadingSpinner = document.getElementById(optionId);
    loadingSpinner.style.display = 'none';
}

function changeModel(spinnerOption) {
    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ "modelName": ymlFileName }),
    };
    console.log(JSON.stringify({ "modelName": ymlFileName }));
    showSpinner(spinnerOption);
    fetch(host_name + '/change_model', requestOptions)
        .then(response => response.json())
        .then(msg => {
            console.log('Response from host:', msg);
            if (msg['status'] == "success") {
                textModelName.textContent = "Model name: " + dict_modelName[modelName] + ", " + dict_upscale[scale];
            };
            hideSpinner(spinnerOption);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            hideSpinner(spinnerOption);
        });
};

function updateYmlFileName(spinnerOption) {
    ymlFileName = "HAT-S_" + scale + modelName.substring(5);
    console.log("update YAML file name:", ymlFileName);
    changeModel(spinnerOption);
};

function updateScale() {
    var spinnerOption;
    if (listGroupCheckableUpscalesX4.checked) {
        scale = "SRx4";
        spinnerOption = "spinner1"
    } else if (listGroupCheckableUpscalesX8.checked) {
        scale = "SRx8";
        spinnerOption = "spinner2";
    }
    console.log("update upscale option:", scale);
    updateYmlFileName(spinnerOption);
};
listGroupCheckableUpscalesX4.addEventListener('change', updateScale);
listGroupCheckableUpscalesX8.addEventListener('change', updateScale);

function updateModelName() {
    var spinnerOption = "spinner0";
    if (listGroupCheckableOriginalModel.checked) {
        modelName = "HAT-S_from_scratch";
        spinnerOption = "spinner3";
    } else if (listGroupCheckableMosaicModel.checked) {
        modelName = "HAT-S_Patch-Mosaic";
        spinnerOption = "spinner4";
    } else if (listGroupCheckablePerceptualLossModel.checked) {
        modelName = "HAT-S_PerceptualLoss_conv2_2";
        spinnerOption = "spinner5";
    } else if (listGroupCheckableMixLossesModel.checked) {
        modelName = "HAT-S_MixLosses";
        spinnerOption = "spinner6";
    }
    console.log("update model name:", modelName);
    updateYmlFileName(spinnerOption);
};
listGroupCheckableOriginalModel.addEventListener('change', updateModelName);
listGroupCheckableMosaicModel.addEventListener('change', updateModelName);
listGroupCheckablePerceptualLossModel.addEventListener('change', updateModelName);
listGroupCheckableMixLossesModel.addEventListener('change', updateModelName);


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
}

uploadBtn.addEventListener("click", e => {
    e.preventDefault();
    // Ghi lại thời điểm bắt đầu
    startTime = new Date();

    const formData = new FormData();
    console.log(imageFile.files[0]);
    formData.append("image", imageFile.files[0]);
    var requestOptions = {
        method: 'POST',
        headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
        }),
        body: formData,
    };
    fetch(host_name + '/upload', requestOptions)
        .then(response => response.blob())
        .then(blob => {
            console.log(blob);
            displaySRImage(blob);
            blobFile = blob;

            // Ghi lại thời điểm kết thúc
            endTime = new Date();

            // Tính thời gian chênh lệch và hiển thị vào div
            displayProcessingTime();
            downloadBtn.disabled = false;
            downloadBtn.style.color = ''; // Set the color to default
            downloadBtn.style.backgroundColor = ''; // Set the background color to default
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });;
});

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;

    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

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
}
