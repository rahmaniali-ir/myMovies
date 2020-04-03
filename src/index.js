// dependencies
const electron = require('electron');
const path = require('path');
// const BrowserWindow = electron.remote.BrowserWindow;
// const ipc = electron.ipcRenderer;
const currentWindow = electron.remote.getCurrentWindow();
const fs = require('fs');
const { exec } = require("child_process");
const Bank = require('../lib/bank');
const { dialog } = electron.remote;
const defaults = require('../lib/defaults');
const checkTargetContents = require('../lib/explorer');

// database connection
const myBank = new Bank(path.join(__dirname, '../database.db'));
let targetFolders = myBank.table('targets');
let movies = myBank.table('movies');

// general variables
let newMoviesCount = 0;
let allowedExtensions = defaults.allowedExtensions;
const apiKey = defaults.apiKey;

function checkForConnection() {
    console.log(navigator.onLine ? 'Online' : 'Offline');
}
checkForConnection();
window.addEventListener('online', checkForConnection);
window.addEventListener('offline', checkForConnection);

// show "select target folders" dialog if there is no target folder
if(targetFolders.length < 1) {
    // showTargetDialog();
}
// showTargetDialog();

// check all files for existence and add them to database if not
targetFolders.data.forEach(target => {
    if(fs.existsSync(target.path)) {
        checkTargetContents(target.path);
    }
});

// handle window state buttons
const windowStates = {
    '#exit': () => currentWindow.close(),
    '#minimize': () => currentWindow.minimize(),
    '#maximize': () => currentWindow.isMaximized() ? currentWindow.restore() : currentWindow.maximize()
};

for(state in windowStates)
    document.querySelector(state).addEventListener('click', windowStates[state]);

// movies.empty();

setTimeout(() => {
    document.querySelector('.loading').classList.add('done');
}, 5000);

movies.data.forEach(movie => {
    // let movieCard = new MovieCard();
    // movieCard.title = movie.name;
    // movieCard.image = movie.Poster;
    // document.querySelector('.movies-wrapper').append(movieCard);
});

// const n = new Notif();
// n.title = 'Hello';
// n.text = 'Description';
// document.querySelector('main').append(n);
// window.customElements.define('notif-box', Notif);
