const { app, BrowserWindow, ipcMain } = require("electron");
const WebSocket = require("ws");
const path = require("path");

let ws;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

app.on("ready", createWindow);

ipcMain.handle("connect-ws", (event, ip, port) => {
  const wsUrl = `ws://${ip}:${port}/ws`;
  console.log("Connecting to WebSocket URL:", wsUrl);
  ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    event.sender.send("ws-connected", "WebSocket connection established");
    // Send the IP and Port to the WebSocket server
    ws.send(`${ip}:${port}`);
  });

  ws.on("message", (data) => {
    event.sender.send("ws-data", data.toString());
  });

  ws.on("close", () => {
    event.sender.send("ws-disconnected", "WebSocket connection closed");
  });

  ws.on("error", (error) => {
    event.sender.send("ws-error", error.message);
  });
});

ipcMain.handle("disconnect-ws", (event) => {
  if (ws) {
    ws.close();
  }
});

ipcMain.handle("send-ws", (event, message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  }
});
