const VideoStreamMerger = require('video-stream-merger')
const robot = require("robotjs");
const { desktopCapturer } = require('electron')

const {fork, spawn} = require('child_process');
const path = require('path');
const {ipcRenderer} = require('electron');
const { formatWithOptions } = require('util');

let mouse = robot.getMousePos();

function runMousePosUpdate() {

  mouse = robot.getMousePos();

  setTimeout(() => {
    runMousePosUpdate();
  }, 15);
}

runMousePosUpdate();

document.addEventListener('DOMContentLoaded', () => {
  // document.getElementById('fork-renderer').addEventListener('click', () => {
  //   const p = fork(path.join(__dirname, 'child.js'), ['hello'], {
  //     stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  //   });
  //   p.stdout.on('data', (d) => {
  //     writeData('[stdout-renderer-fork] ' + d.toString());
  //   });
  //   p.stderr.on('data', (d) => {
  //     writeData('[stderr-renderer-fork] ' + d.toString());
  //   });
  //   p.send('hello');
  //   p.on('message', (m) => {
  //     writeData('[ipc-main-fork] ' + m);
  //   });
  // });

  document.getElementById('spawn-renderer').addEventListener('click', () => {
    // const p = spawn(process.execPath, ['child.js'] 
    //   // [ path.join(__dirname, 'child.js'), 'args']
    //   , {
    //   stdio: 'pipe'
    // });
    // // p.stdout.on('data', (d) => {
    // //   writeData('[stdout-renderer-fork] ' + d.toString());
    // // });
    // // p.stderr.on('data', (d) => {
    // //   writeData('[stderr-renderer-fork] ' + d.toString());
    // // });
    // // p.send('hello');
    // // p.on('message', (m) => {
    // //   writeData('[ipc-main-fork] ' + m);
    // // });

    // p.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    // });
    
    // p.stderr.on('data', (data) => {
    //   console.log(`stderr: ${data}`);
    // });
    
    // p.on('close', (code) => {
    //   console.log(`child process exited with code ${code}`);
    // });

    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });

  

  document.getElementById('fork-main').addEventListener('click', () => {
    ipcRenderer.send('fork');
  });

  const output = document.getElementById('output');
  ipcRenderer.on('data', (e, data) => {
    writeData(data);
  });

  function writeData(data) {
    output.innerText = output.innerText + '\n' + data;
  }
});





desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
  for (const source of sources) {
    console.log('source', source);
    if (source.name === 'Screen 1') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              // minWidth: 1280,
              // maxWidth: 1280,
              // minHeight: 720,
              // maxHeight: 720

              // minWidth: 2880,
              // maxWidth: 2880,
              // minHeight: 1800,
              // maxHeight: 1800

              // minWidth: 2880 / 2,
              // maxWidth: 2880 / 2,
              // minHeight: 1800 / 2,
              // maxHeight: 1800 / 2
            }
          }
        })
        handleStream(stream)
      } catch (e) {
        handleError(e)
      }
      return
    }
  }
})

function handleStream (stream) {


  // const merger = new VideoStreamMerger()
  const merger = new VideoStreamMerger(
    {
      width: 50,   // Width of the output video
      height: 50,  // Height of the output video
      fps: 500,       // Video capture frames per second
      clearRect: true, // Clear the canvas every frame
      audioContext: null, // Supply an external AudioContext (for audio effects)
    }
  )

  // Add the screen capture. Position it to fill the whole stream (the default)
  merger.addStream(stream, {
    x: 0, // position of the topleft corner
    y: 0,
    width: merger.width,
    height: merger.height,
    mute: true, // we don't want sound from the screen (if there is any)
    draw: (ctx, frame, done) => {
      // You can do whatever you want with this canvas context
      // ctx.drawImage(frame, (mouse.x / 2) - 12, (mouse.y / 2) - 12, 25, 25, 0, 0, merger.width, merger.height)
      // crop
      // crop.sourceRect = new createjs.Rectangle(50,10,60,100);
      // stage.addChild(crop);
      // crop.y = 100;

      // console.log('frame', frame);

      ctx.drawImage(frame, (mouse.x) - 25, (mouse.y) - 25, 50, 50, 0, 0, merger.width, merger.height)

      // ctx.drawImage(cropped, 0, 0, merger.width, merger.height)
      done()
    },
  })

  merger.start();

  const video = document.querySelector('video')
  video.srcObject = merger.result
  // video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}

function handleError (e) {
  console.log(e)
}