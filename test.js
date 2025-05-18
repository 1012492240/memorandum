// package.json

{
    "name": "my-electron-app",
        "version": "1.0.0",
            "main": "main.cjs",
                "scripts": {
        "start": "electron ."
    },
    "devDependencies": {
        "electron": "^28.2.0"
    }
}


// main.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
        },
    });

    // 载入打包好的网页
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    // 可选：打开开发者工具
    // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


