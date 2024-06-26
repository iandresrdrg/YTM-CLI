const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  protocol,
  screen,
  globalShortcut,
} = require("electron");
const path = require("path");

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL("https://youtube.com");
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const x = width - (mainWindow.getBounds().width - 20);
  const y = 0;

  mainWindow.setPosition(x, y);
  mainWindow.on("close", function (event) {
    if (app.quitting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });

  // Agregar el ícono a la barra de notificaciones
  const iconPath = path.join(__dirname, "icon_bartool.png"); // Reemplaza 'path-to-your-icon.png' con la ruta a tu icono
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Mostrar Aplicación",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Salir",
      click: () => {
        app.quitting = true;
        app.exit(); // Cambiado de app.quit() a app.exit()
      },
    },
  ]);

  // Manejar doble clic en el ícono para mostrar/ocultar la ventana
  tray.on("right-click", () => {
    contextMenu.popup(mainWindow);
  });

  // Manejar doble clic en el ícono para mostrar/ocultar la ventana
  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.on("ready", () => {
  createWindow();

  mainWindow.on("focus", () => {
    globalShortcut.register("CommandOrControl+Q", () => {
      mainWindow.hide();
    });
  });

  mainWindow.on("blur", () => {
    globalShortcut.unregister("CommandOrControl+Q");
  });

  // Configuración para ocultar la aplicación en el dock en macOS
  if (process.platform === "darwin") {
    app.dock.hide();

    protocol.registerFileProtocol("app", (request, callback) => {
      const url = request.url.replace("app://", "");
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    });

    app.setAsDefaultProtocolClient("app");
  }
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.exit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

// Manejar el evento 'before-quit' para limpiar la bandeja
app.on("before-quit", () => {
  tray.destroy();
});
