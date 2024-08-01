const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const WebSocket = require("ws");

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

ipcMain.handle("start-server", async (event, ip, tcpPort) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/start?ip=${ip}&tcpPort=${tcpPort}`
    );

    event.sender.send("server-message", response.data);
  } catch (error) {
    console.error("Error starting server:", error);
    event.sender.send(
      "server-message",
      `Error starting server: ${error.message}`
    );
  }
});

ipcMain.handle("connect-ws", (event) => {
  const wsUrl = `ws://localhost:6000/ws`;
  console.log("Connecting to WebSocket URL:", wsUrl);
  ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    event.sender.send("ws-connected", "WebSocket connection established");
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

ipcMain.handle("disconnect-ws", async (event, ip, tcpPort) => {
  if (ws) {
    ws.close();
  }
  try {
    const response = await axios.get(
      `http://localhost:8080/stop?ip=${ip}&tcpPort=${tcpPort}`
    );
    event.sender.send("server-message", response.data);
  } catch (error) {
    console.error("Error stopping server:", error);
    event.sender.send(
      "server-message",
      `Error stopping server: ${error.message}`
    );
  }
});
