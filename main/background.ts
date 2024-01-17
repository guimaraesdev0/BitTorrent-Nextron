import path from 'path';
import { app, ipcMain, dialog, BrowserWindow, ipcRenderer } from 'electron';
import serve from 'electron-serve';
import Store from 'electron-store';
import torrentStream from 'torrent-stream';
const { Notification } = require('electron')




const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let mainWindow: BrowserWindow | null = null;

; (async () => {
  await app.whenReady();

  mainWindow = new BrowserWindow({
    title: 'Loading QbitClient',
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  new Notification({
    title: 'QbitClient',
    body:  'The Application has been successfully launched.'
  }).show()


  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

type StoreType = {
  messages: string[];
  downloadList: string[]
};

const store = new Store<StoreType>({ name: 'messages' });


ipcMain.on('get-messages', (event) => {
  event.reply('messages', store.get('messages') || []);
});

ipcMain.on('starttorrent', async (event, magnetLink:string) => {
  if (mainWindow) {
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Choose Download Location',
    });


    if (!result.canceled && result.filePaths.length > 0) {
      const downloadPath = result.filePaths[0];

      const engine = torrentStream(magnetLink, { path: downloadPath });

      engine.on('ready', () => {


        const fileName = engine.files[0].name;

        new Notification({
          title: 'QbitClient Nextron',
          body:  'The download has started...'
        }).show()

        // Print the number of peers
        console.log(`Peers QTD: ${engine.swarm.wires.length}`);

        // Inpresses the amount of files present in the file
        console.log(`Number of Files: ${engine.files.length}\n\n\n\n`);

        let totalDownloaded = 0;
        let totalSize = 0;
        let startTime = Date.now();

        // Calcular o tamanho total do torrent
        engine.files.forEach(file => {
          totalSize += file.length;
        });

        engine.files.forEach(file => {
          const stream = file.createReadStream();
          const filePath = path.join(downloadPath, file.path);

          stream.pipe(require('fs').createWriteStream(filePath));
        });


        // Set up a timer to print progress information every second
        const intervalId = setInterval(() => {
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          totalDownloaded = engine.swarm.downloaded;
          const progress = (totalDownloaded / totalSize) * 100;
          const downloadSpeed = engine.swarm.downloadSpeed();
          const remainingTime = ((totalSize - totalDownloaded) / downloadSpeed) * elapsedSeconds;

          function convertBytesToMBps(bytesPerSecond: number): number {
            const bytesInMB = 1024 * 1024;
            return bytesPerSecond / bytesInMB;
          }
          const downloadSpeedInBytesPerSecond = engine.swarm.downloadSpeed();
          const downloadSpeedInMBps = convertBytesToMBps(downloadSpeedInBytesPerSecond);


          console.log(`\n\n\n\nDownload: ${magnetLink}\nProgress: ${progress.toFixed(2)}%`);
          console.log(`Total de: ${totalDownloaded}`)
          console.log(`Download Speed: ${downloadSpeed} bytes/seconds`);
          console.log(`Timeleft: ${remainingTime.toFixed(2)} seconds\n\n\n`);


          const downloadList: Array<any> = store.get('downloadList') || []; 
          const existingDownload = downloadList.find(item => item.magnetlink === magnetLink);

          if (existingDownload) {
            existingDownload.progress = progress.toFixed(2);
            existingDownload.totalDownloaded = 0;
            existingDownload.startTime = Date.now();
            existingDownload.downloadSpeed = downloadSpeedInMBps.toFixed(2);
          } else {
            downloadList.push({
              title: 'Resident Evil - Village [FitGirl Repack]',
              magnetlink: magnetLink,
              progress: 0,
              totalDownloaded: 0,
              downloadSpeed: 0,
              remainingTime: Infinity,
              peers:engine.swarm.wires.length,
              startTime: Date.now(),
            });
          }
          store.set('downloadList', downloadList);

          if (progress >= 100) {
            console.log(`\n\nDownload concluído com sucesso no local: ${result.filePaths[0]}\n\n`)
            clearInterval(intervalId);
          }
        }, 1000);
      });

      engine.on('idle', () => {
        console.log('Download concluído.');
        new Notification({
          title: 'QbitClient',
          body: 'O '
        }).show()
        return;
      });
    }
  }
});

ipcMain.on('DeleteHistory', (event, arg) => {
    store.delete('downloadList')
})

ipcMain.on('updateList', (_event, arg) => {
  const downloadList = store.get('downloadList') || [];
  _event.reply('downloadList', store.get('downloadList') || [])

});

ipcMain.on('add-message', (_event, arg) => {
  const messages = store.get('messages') || [];
  messages.push(arg);
  store.set('messages', messages);
});
