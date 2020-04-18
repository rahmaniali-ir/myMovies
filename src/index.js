// dependencies
const electron = require('electron');
const path = require('path');
// const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const currentWindow = electron.remote.getCurrentWindow();
const fs = require('fs');
const { exec } = require("child_process");
const Bank = require('../lib/bank');
const { dialog } = electron.remote;
let settings = require('../lib/settings');
const { checkTargetFolders, saveImage } = require('../lib/explorer');

// database connection
const myBank = new Bank(path.join(__dirname, '../database.db'));
let targetFolders = myBank.table('targets');
let movies = myBank.table('movies');

// general variables
let newMoviesCount = 0;
let allowedExtensions = settings.allowedExtensions;
const apiKey = settings.apiKey;

function checkForConnection() {
    console.log(navigator.onLine ? 'Online' : 'Offline');
}
checkForConnection();
window.addEventListener('online', checkForConnection);
window.addEventListener('offline', checkForConnection);

// opens dialog to select a folder as a target folder
function showTargetDialog() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(res => {
        const selectedFolder = res.filePaths[0];
        if(selectedFolder) {
            // console.log(targetFolders);
            targetFolders.insert({ path: selectedFolder });
        }
    });
}

// show "select target folders" dialog if there is no target folder
if(targetFolders.length < 1) {
    showTargetDialog();
}
// showTargetDialog();

function hideLoading() {
    document.querySelector('.loading').classList.add('done');
}

let time = 0;
let loadingDone = false;
let timer = setInterval(() => {
    time++;

    if(loadingDone && time > 0) {
        hideLoading();
        clearInterval(timer);
    }
}, 1000);

function renderMovies() {
    let allMovies = movies.data;
    let moviesWrapper = document.querySelector('.movies-wrapper');

    setTimeout(() => {
        allMovies.forEach((movie, index) => {
            setTimeout(() => {
                let mov = new MovieCard();
                mov.name = movie.name;
                mov.image = movie.image ? fs.readFileSync(movie.image) : '';

                mov.addEventListener('play', () => {
                    exec(`"${ movie.path }"`);
                });

                mov.addEventListener('mouse-in', () => {
                    moviesWrapper.classList.add('mouse-in');
                });

                mov.addEventListener('mouse-out', () => {
                    moviesWrapper.classList.remove('mouse-in');
                });

                document.querySelector('.movies-wrapper').append(mov);
            }, 50 * index);
        });
    }, 1000);
}

function notifyNewMovies(newMovies) {
    let newMoviesNotif = new Notif();
    newMoviesNotif.status = 'information';
    newMoviesNotif.duration = 5;

    if(newMovies > 0) {
        newMoviesNotif.name = 'New movies discovered!';
        let text = newMovies > 1 ? `${ newMovies } new movies` : `A new movie`;
        newMoviesNotif.text = text + ' has been added!';
    } else {
        newMoviesNotif.name = 'All the same!';
        newMoviesNotif.text = 'No new movie found.';
    }
    document.body.appendChild(newMoviesNotif);
}

checkTargetFolders().then(newMovies => {
    loadingDone = true;
    renderMovies();
    notifyNewMovies(newMovies);
}).catch(err => console.error(err));

// ipc.send('ha');
// ipc.on('coloor', (e, color) => {
//     console.log(color);
// })

// handle window state buttons
const windowStates = {
    '#exit': () => currentWindow.close(),
    '#minimize': () => currentWindow.minimize(),
    '#maximize': () => currentWindow.isMaximized() ? currentWindow.restore() : currentWindow.maximize()
};
for(state in windowStates)
    document.querySelector(state).addEventListener('click', windowStates[state]);
