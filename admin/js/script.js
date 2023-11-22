const host_name = "https://sensibly-stirring-possum.ngrok-free.app";


const logPlaceholder = document.getElementById('liveLogPlaceholder');
const feedbackTable = document.getElementById('feedback-table');
const errorPlaceholder = document.getElementById('liveErrorPlaceholder');

let log_cnt = 0;
let defaultDate = "1900-01-01 00:00:01";
let currentFeedbackDate = defaultDate;
let currentLogDate = defaultDate;
let login_status = false;

const alertError = (message, type) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible text-start" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');
    if (errorPlaceholder.firstChild) {
        errorPlaceholder.insertBefore(wrapper, errorPlaceholder.firstChild);
    }
    else {
        errorPlaceholder.append(wrapper);
    };
};

const alertLog = (message, type) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} text-start m-0" role="alert">`,
        `   <div>${message}</div>`,
        '</div>'
    ].join('');
    if (logPlaceholder.firstChild) {
        logPlaceholder.insertBefore(wrapper, logPlaceholder.firstChild);
    }
    else {
        logPlaceholder.append(wrapper);
    };
};

const alertFeedback = (feedback) => {
    const wrapper = document.createElement('tr');
    wrapper.innerHTML = [
        `<td>${feedback.substring(0, 19)}</td><td>${feedback.substring(22)}</td>`,
    ].join('');
    if (feedbackTable.firstChild) {
        feedbackTable.insertBefore(wrapper, feedbackTable.firstChild);
    }
    else {
        feedbackTable.append(wrapper);
    };
};


function updateLogs() {
    if (!login_status) {
        $('#loginModal').modal('show');
        return;
    }
    fetchToServer("log", currentLogDate);
}

function clearLogs() {
    if (!login_status) {
        $('#loginModal').modal('show');
        return;
    }
    while (logPlaceholder.hasChildNodes()) {
        logPlaceholder.removeChild(logPlaceholder.firstChild);
    }
    currentLogDate = defaultDate;
}

function deleteLogs() {
    $('#verifyDelLogModal').modal('show');
}

function updateFeedbacks() {
    if (!login_status) {
        $('#loginModal').modal('show');
        return;
    }
    fetchToServer("feedback", currentFeedbackDate);
}

function clearFeedbacks() {
    if (!login_status) {
        $('#loginModal').modal('show');
        return;
    }
    while (feedbackTable.hasChildNodes()) {
        feedbackTable.removeChild(feedbackTable.firstChild);
    }
    currentFeedbackDate = defaultDate;
}

function deleteFeedbacks() {
    $('#verifyDelFbModal').modal('show');

}

function getTime() {
    let date = new Date();
    var currentdate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.toLocaleTimeString();
    alertError(currentdate, 'light');
    return currentdate;
}

function fetchToServer(request, time) {
    console.log(request, time);
    const formData = new FormData();
    formData.append("request", request);
    formData.append("time", time);
    var requestOptions = {
        method: 'POST',
        headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
        }),
        body: formData,
    };
    fetch(host_name + '/admin', requestOptions)
        .then(response => {
            let contentType = response.headers.get('Content-Type');
            if (contentType.includes('application/json')) {
                response.json().then(data => {
                    console.log(data);
                    if ('feedback' in data) {
                        if (data['feedback'] == '') {
                            alertError("There are no new feedbacks", 'success')
                            return;
                        };
                        const feedbacks = data['feedback'].split('\n');
                        feedbacks.forEach(element => {
                            alertFeedback(element);
                            currentFeedbackDate = element.substring(0, 19);
                        });
                    } else if ('log' in data) {
                        if (data['log'] == '') {
                            alertError("There are no new logs", 'success')
                            return;
                        };
                        const logs = data['log'].split('\n');
                        logs.forEach(element => {
                            element = element.replaceAll(' | ', '<br>');
                            if (element.search("'status': 'success'") == -1) {
                                alertLog(element, 'danger');
                            } else {
                                alertLog(element, 'info');
                            }
                            currentLogDate = element.substring(0, 19);
                        });
                    } else if ('password' in data) {
                        if (data['password'] == 'correct') {
                            login_status = true;
                            $('#loginModal').modal('hide');
                        }
                    } else if ('del_log' in data) {
                        if (data['del_log'] == 'success')
                            alertError("Delete logs successfully", 'info');
                        else
                            alertError(data['del_log'], 'danger');
                    } else if ('del_feedback' in data) {
                        if (data['del_feedback'] == 'success')
                            alertError("Delete feedbacks successfully", 'info');
                        else
                            alertError(data['del_feedback'], 'danger');
                    } else if ('error' in data) {
                        alertError(data['error'], 'danger');
                    }
                });
            } else {
                alertError("Unsupported data type!", 'danger');
            }
        })
        .catch(error => {
            alertError('Fetch error! Try again!', 'danger');
        });
}

$(window).on('load', function () {
    $('#loginModal').modal('show');
});

$(document).ready(function (e) {
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        var password = $("#modalpass").val();
        fetchToServer('password', password);
    });
    $("#verifyDelLogForm").submit(function (event) {
        event.preventDefault();
        var password = $("#verifyDelLog").val();
        $('#verifyDelLogModal').modal('hide');
        while (logPlaceholder.hasChildNodes()) {
            logPlaceholder.removeChild(logPlaceholder.firstChild);
        }
        currentLogDate = defaultDate;
        fetchToServer('del_log', password);
    });
    $("#verifyDelFbForm").submit(function (event) {
        event.preventDefault();
        var password = $("#verifyDelFb").val();
        $('#verifyDelFbModal').modal('hide');
        while (feedbackTable.hasChildNodes()) {
            feedbackTable.removeChild(feedbackTable.firstChild);
        }
        currentFeedbackDate = defaultDate;
        fetchToServer("del_feedback", password);
    });
});
