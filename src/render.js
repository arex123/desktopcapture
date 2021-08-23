//buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

videoSelectBtn.onclick = getVideoSources;

const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;
//get the available video sources
async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        type: ['window', 'screen']
    });
    
const videoOptionMenu = Menu.buildFromTemplate(
  inputSources.map(source =>{
      return{
          label:source.name,
          click:()=> selectSource(source)
      };
  })
);

videoOptionMenu.popup();
}
