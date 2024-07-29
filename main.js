const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const WebSocket = require("ws");

let mainWindow;
let ws;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("connect-ws", (event, ip, port) => {
  ws = new WebSocket(`ws://${ip}:${port}/ws`);

  ws.on("open", () => {
    mainWindow.webContents.send(
      "ws-connected",
      "Connected to WebSocket server"
    );
  });

  ws.on("message", (data) => {
    mainWindow.webContents.send("ws-data", data.toString());
  });

  ws.on("close", () => {
    mainWindow.webContents.send(
      "ws-disconnected",
      "Disconnected from WebSocket server"
    );
  });

  ws.on("error", (error) => {
    mainWindow.webContents.send("ws-error", error.message);
  });
});

ipcMain.handle("disconnect-ws", () => {
  if (ws) {
    ws.close();
  }
});

ipcMain.handle("send-ws", (event, message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    mainWindow.webContents.send("ws-error", "WebSocket is not connected");
  }
});
