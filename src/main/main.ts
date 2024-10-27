import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { execSync } from 'child_process';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('get-installed-versions', async () => {
  const installedVersions = await getInstalledNodeVersions();
  const currentNodeVersion = getCurrentNodeVersion();
  return installedVersions.map(version => ({
    version,
    active: version === currentNodeVersion,
  }));
});

const getInstalledNodeVersions = async () => {
  const fs = require('fs');
  const nvmDir = process.env.NVM_HOME;

  if (!nvmDir) {
    console.error('NVM_HOME environment variable is not set.');
    return [];
  }

  try {
    const versions = await fs.promises.readdir(nvmDir);
    return versions.filter(version => version.startsWith('v')).map(version => version.replace('v', ''));
  } catch (error) {
    console.error('Error reading Node.js versions:', error);
    return [];
  }
};

const getCurrentNodeVersion = () => {
  let version = execSync('node -v').toString().trim();
  version = version.replace(/^v/, '');
  return version
};

ipcMain.handle('use-version', async (event, version: string) => {
  try {
    console.log(version);
    execSync(`nvm use ${version}`);
    return true;
  } catch (error) {
    console.error('Error using version:', error);
    return false;
  }
});

ipcMain.handle('install-version', async (event, version: string) => {
  try {
    execSync(`nvm install ${version}`);
    return { success: true, message: `Node.js version ${version} installed successfully.` };
  } catch (error) {
    console.error('Error installing version:', error);
    return { success: false, message: 'Failed to install Node.js version. Please check logs.' };
  }
});

ipcMain.handle('remove-version', async (event, version: string) => {
  try {
    execSync(`nvm uninstall ${version}`);
    console.log(`Node.js version ${version} uninstalled successfully.`);
    return { success: true, message: `Node.js version ${version} removed successfully.` };
  } catch (error) {
    console.error(`Failed to uninstall Node.js version ${version}:`, error);
    return { success: false, message: `Failed to remove Node.js version ${version}.` };
  }
});

ipcMain.handle('get-proxy', async () => {
  return getProxy();
});


const getProxy = async () => {
  const conf = process.platform == 'win32' ? 'settings.txt' : 'nvm.conf';
  const fs = require('fs');
  if (process.platform === 'win32') {
    const settingsFile = path.join(process.env.NVM_HOME || '', conf);

    try {
      if (fs.existsSync(settingsFile)) {
        const settingsContent = await fs.promises.readFile(settingsFile, 'utf-8');
        return parseConfigFile(settingsContent);
      } else {
        console.error('settings.txt file not found.');
        return { proxyUrl: '', proxyPort: '' };
      }
    } catch (error) {
      console.error('Error reading settings.txt:', error);
      return { proxyUrl: '', proxyPort: '' };
    }
  } else {
    console.log('Not running on Windows.');
    return { proxyUrl: '', proxyPort: '' };
  }

}



// Function to parse the config file and extract proxy settings
const parseConfigFile = (content: string) => {
  const proxyMatch = content.match(/proxy:\s*(http:\/\/.+:\d+)/);

  if (!proxyMatch) {
    return { proxyUrl: '', proxyPort: '' };
  }

  const proxyUrlWithProtocol = proxyMatch[1];
  const url = new URL(proxyUrlWithProtocol);

  const proxyUrl = url.hostname;
  const proxyPort = url.port;

  return { proxyUrl, proxyPort };
};

ipcMain.handle('set-proxy', (event, proxyUrl, proxyPort) => {
  execSync(`nvm proxy http://${proxyUrl}:${proxyPort}`);
  return { success: true, message: `Proxy ${proxyUrl}:${proxyPort} successfully.` };
});

ipcMain.handle('get-recommended-versions', async (event, version: string) => {
  try {
    const { proxyUrl, proxyPort } = await getProxy();
    const proxyAgent = new HttpsProxyAgent(`http://${proxyUrl}:${proxyPort}`);
    const response = await fetch('https://nodejs.org/download/release/index.json', {
      agent: proxyAgent
    });
    const data = await response.json();
    return { success: true, data }
  } catch (error) {
    console.error('Error when fetch version:', error);
    return { success: false, message: 'Failed to fetch recommended versions.' };
  }
});



if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 900,
    height: 650,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', async () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open URLs in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Auto-updates
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the macOS convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS, recreate a window when the dock icon is clicked
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
