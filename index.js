let fs = require("fs");
let path = require("path");
const WebSocket = require('ws');

let isEnabled = false;
let controller = undefined;
let messagePorts = new Set();

const SERVER_PORT = 10972;

let wss = undefined;
let figmaConnection = undefined;

function onWebsocketMessage(){
  console.log('Received: %s', message);
}

function startWebSocketServer(port) {
  wss = new WebSocket.Server({ port: port, host: "127.0.0.1" });

  wss.on('connection', (ws) => {
      figmaConnection?.terminate();
      figmaConnection = ws;
      ws.on('message', onWebsocketMessage);
      ws.on('error', () => {
        figmaConnection?.terminate();
        figmaConnection = undefined;
        sendCurrentConnectionStatus();
      })
      ws.on("close", () => { sendCurrentConnectionStatus(); });
      sendCurrentConnectionStatus();
  });

  wss.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying another port...`);
        startWebSocketServer(0); // Try random port
    } else {
        console.error('WebSocket server encountered an error:', err);
    }
  });

  wss.on('listening', () => {
    console.log(`WebSocket server is listening on port ${wss.address().port}`);
    sendCurrentConnectionStatus();
  });
}


exports.loadPackage = async function (gridController, persistedData) {
  controller = gridController;

  let figmaIconSvg = fs.readFileSync(
    path.resolve(__dirname, "figma_logo.svg"),
    { encoding: "utf-8" },
  );

  let actionHtml = fs.readFileSync(
    path.resolve(__dirname, "figma_action.html"),
    { encoding: "utf-8" },
  );
  controller.sendMessageToRuntime({
    id: "add-action",
    info: {
      actionId: 0,
      short: "xfigma",
      name: "Figma_Action",
      displayName: "Figma Action",
      rendering: "standard",
      category: "figmal",
      blockTitle: "Figma Action",
      defaultLua: 'gps("package-figma", "selected", "opacity", val)',
      color: "#1E1E1E",
      icon: figmaIconSvg,
      blockIcon: figmaIconSvg,
      selectable: true,
      movable: true,
      hideIcon: false,
      type: "single",
      toggleable: true,
      actionHtml: actionHtml,
    },
  });

  startWebSocketServer(SERVER_PORT);

  isEnabled = true;
};

exports.unloadPackage = async function () {
  controller.sendMessageToRuntime({
    id: "remove-action",
    actionId: 0,
  });
  controller = undefined;
  messagePorts.forEach((port) => port.close());
  messagePorts.clear();
  wss?.close();
};

exports.addMessagePort = async function (port) {
  port.on("message", (e) => {
    onMessage(port, e.data);
  });
  messagePorts.add(port);
  port.on("close", () => {
    messagePorts.delete(port);
  });
  port.start();
  sendCurrentConnectionStatus();
};

function sendCurrentConnectionStatus(){
  messagePorts.forEach((port) => {
    const serverAddress = wss ? `${wss.address().address}:${wss.address().port}` : "Not running";
    const clientConnected = figmaConnection?.readyState == 1;
    port.postMessage({
      type: "status",
      serverAddress,
      clientConnected,
    });
  });
}

exports.sendMessage = async function (args) {
  if (figmaConnection?.readyState != 1) {
    controller.sendMessageToRuntime(
      {
        id: "show-message",
        message: "No connection to figma!",
        messageType: "fail",
      }
    )
    return;
  }

  figmaConnection.send(JSON.stringify({
    selectedNodes: args[0],
    targetProperty: args[1],
    value: args[2],
  }));
};