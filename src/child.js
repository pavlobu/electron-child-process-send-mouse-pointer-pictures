const { desktopCapturer } = require('electron')

const blake2 = require('blake2');
console.log('ExecPath', process.execPath);

process.on('message', (m) => {
  console.log('Got message:', m);
  const h = blake2.createHash('blake2b', {digestLength: 32});
  h.update(Buffer.from(m));
  process.send(`Hash of ${m} is: ${h.digest('hex')}`);
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
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720
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
  const video = document.querySelector('video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}

function handleError (e) {
  console.log(e)
}