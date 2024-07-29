const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  connectWS: (ip, port) => ipcRenderer.invoke("connect-ws", ip, port),
  sendWS: (message) => ipcRenderer.invoke("send-ws", message),
  disconnectWS: () => ipcRenderer.invoke("disconnect-ws"),
  onWSData: (callback) =>
    ipcRenderer.on("ws-data", (event, data) => callback(data)),
  onWSConnected: (callback) =>
    ipcRenderer.on("ws-connected", (event, data) => callback(data)),
  onWSDisconnected: (callback) =>
    ipcRenderer.on("ws-disconnected", (event, data) => callback(data)),
  onWSError: (callback) =>
    ipcRenderer.on("ws-error", (event, data) => callback(data)),
});
