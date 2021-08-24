//run this with npm start on terminal
//buttons

const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

videoSelectBtn.onclick = getVideoSources;

let tempstart = false;
startBtn.onclick= e=>{
    if(tempstart==false)
    {
        mediaRecorder.start();
        startBtn.classList.add('is-danger');
        startBtn.innerText = 'Stop-Recording';
        tempstart = true;
    }else{
        mediaRecorder.stop();
        startBtn.classList.remove('is-danger');
        startBtn.innerText = 'Start'; 
        tempstart = false;
    }
    
};

// stopBtn.onclick= e =>{
//     mediaRecorder.stop();
//     startBtn.classList.remove('is-danger');
//     startBtn.innerText = 'Start';
// };


const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;


//get the available video sources
async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });
    
const videoOptionsMenu = Menu.buildFromTemplate(
  inputSources.map(source =>{
      return{
          label:source.name,
          click:()=> selectSource(source)
      };
  })
);

videoOptionsMenu.popup();
}

let mediaRecorder; //mediaRecorder instance to capture footage
const recordedChunks = [];  //it will save chunks of video, we will save segments of video in this array

//change the videosource window to record
async function selectSource(source){
    videoSelectBtn.innerText = source.name;

    const constraintsVideo = {
        video: {
            mandatory:{
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    const constraintsAudio={
        audio:true,
    }
    const audioStream = await navigator.mediaDevices.getUserMedia(constraintsAudio)
    const videoStream = await navigator.mediaDevices.getUserMedia(constraintsVideo)


    const stream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()])

    //create a stream
    // const stream = await navigator.mediaDevices
    //     .getUserMedia(constraints);

    //preview the source in a video element
    videoElement.srcObject = stream
    videoElement.muted = true
    videoElement.play()
    

    //create the media recorder
    const options = { mimeType: 'video/webm; codecs-vp9'};
    mediaRecorder = new MediaRecorder(stream, options);

    //register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

//captures all recorded chunks
function handleDataAvailable(e){
    console.log('video data available');
    recordedChunks.push(e.data);
}

const { dialog } = remote;
const { writeFile } = require('fs');
//save the video file on stop
async function handleStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webm : codecs=vp9'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel : 'Save video',
        defaultPath: `vid-${Date.now()}.webm`   //Note that it is a backtick, not a quote

    });
    console.log(filePath);
    writeFile(filePath,buffer,()=> console.log('vide saved successfully!'));
}