// ==========================================
// AI Human Identifier
// script.js
// Part 1
// ==========================================

// HTML Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const statusText = document.getElementById("status");
const categoryText = document.getElementById("category");
const ageText = document.getElementById("age");
const genderText = document.getElementById("gender");
const confidenceText = document.getElementById("confidence");

// Load AI Models
async function loadModels() {

    statusText.innerHTML = "Loading AI Models...";

    const MODEL_URL = "models";

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

    statusText.innerHTML = "Models Loaded ✔";

}

// Start Camera
async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "user"
            },

            audio: false

        });

        video.srcObject = stream;

    } catch (error) {

        console.error(error);

        statusText.innerHTML = "Camera Permission Denied";

    }

}

// Initialize
async function init() {

    await loadModels();

    await startCamera();

}

init();

// Wait until video starts
video.addEventListener("loadedmetadata", () => {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

});

// ==========================================
// PART 2
// Real-Time Face Detection
// ==========================================

video.addEventListener("play", () => {

    // Match canvas size to the video
    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    };

    faceapi.matchDimensions(canvas, displaySize);

    // Detect every 200ms
    setInterval(async () => {

        // Detect faces
        const detections = await faceapi
            .detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withAgeAndGender();

        // Resize results
        const resized = faceapi.resizeResults(
            detections,
            displaySize
        );

        // Clear previous drawings
        const ctx = canvas.getContext("2d");
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Draw face boxes
        faceapi.draw.drawDetections(
            canvas,
            resized
        );

        // Draw landmarks
        faceapi.draw.drawFaceLandmarks(
            canvas,
            resized
        );

const ctx = canvas.getContext("2d");

ctx.font = "22px Arial";
ctx.fillStyle = "#00FF00";
ctx.strokeStyle = "#000";
ctx.lineWidth = 3;

resized.forEach((result, index)=>{

    const age = Math.round(detections[index].age);

    const gender = detections[index].gender;

    const category = classifyPerson(age, gender);

    const box = result.detection.box;

    const text =
        category + " (" + age + ")";

    ctx.strokeText(
        text,
        box.x,
        box.y - 10
    );

    ctx.fillText(
        text,
        box.x,
        box.y - 10
    );

});
        // Update information panel
      if(detections.length > 0){

    const person = detections[0];

    const age = Math.round(person.age);

    const gender = person.gender;

    const category = classifyPerson(age, gender);

    categoryText.innerHTML = category;

    ageText.innerHTML = age + " years";

    genderText.innerHTML =
        gender.charAt(0).toUpperCase() +
        gender.slice(1);

    confidenceText.innerHTML =
        (person.genderProbability * 100).toFixed(1) + "%";

    statusText.innerHTML = "Face Detected";

}
        else {

            statusText.innerHTML =
                "No Face Detected";

            categoryText.innerHTML = "--";
            ageText.innerHTML = "--";
            genderText.innerHTML = "--";
            confidenceText.innerHTML = "--";

        }

    }, 200);

});

// ==========================================
// Human Category Classifier
// ==========================================

function classifyPerson(age, gender){

    gender = gender.toLowerCase();

    // Baby
    if(age <= 2){
        return "👶 Baby";
    }

    // Children
    if(age >= 3 && age <= 17){

        if(gender === "male"){
            return "👦 Boy";
        }else{
            return "👧 Girl";
        }

    }

    // Adults
    if(age >= 18 && age <= 59){

        if(gender === "male"){
            return "👨 Man";
        }else{
            return "👩 Woman";
        }

    }

    // Seniors

    if(gender === "male"){
        return "👴 Old Man";
    }

    return "👵 Old Woman";

}
// ==========================================
// Stable Age Estimation
// ==========================================

const ageHistory = [];

const MAX_HISTORY = 8;

// ==========================================
// Smooth Age
// ==========================================

function smoothAge(index, age){

    if(!ageHistory[index]){
        ageHistory[index] = [];
    }

    ageHistory[index].push(age);

    if(ageHistory[index].length > MAX_HISTORY){
        ageHistory[index].shift();
    }

    const total = ageHistory[index].reduce((a,b)=>a+b,0);

    return Math.round(total / ageHistory[index].length);

}