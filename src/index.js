// dependencies
const electron = require('electron');
const path = require('path');
const BrowserWindow = electron.remote.BrowserWindow;
const currentWindow = electron.remote.getCurrentWindow();
const ipc = electron.ipcRenderer;
const fs = require('fs');
const { exec } = require("child_process");
const Bank = require('../lib/bank');
const { dialog } = electron.remote;

// database
const myBank = new Bank(path.join(__dirname, '../database.db'));
let targetFolders = myBank.table('targets');
let movies = myBank.table('movies');

// general variables
let newMoviesCount = 0;
let allowedExtensions = [
    'mkv',
    'mp4',
    'avi',
    'mov',
    'wmv'
];
const apiKey = 'fb20a8a5';

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

async function getFromAPI(title, year) {
    title = title.replace(/\s/g, '+');
    const response = await fetch(`http://www.omdbapi.com/?t=${ title }&y=${ year }&apikey=${ apiKey }`);
    return await response.json();
}

// gets path of file and returns name, year, type and extension
function parseName(file) {
    // removes parent from path to get the name
    let original = path.basename(file);
    let full = original;
    
    // removes additional information
    full = full.replace(/720p|1080p|bluray/g, '');

    // check if it's file or directory
    let isDirectory = fs.lstatSync(file).isDirectory();

    // finding year
    const yearMatch = full.match(/\d{4}/g);
    let year = yearMatch && yearMatch[0] ? Number(yearMatch[0]) : null;
    if(year == 1080) year = null;

    // find extension
    let extension = full.substr(full.lastIndexOf('.')).replace('.', '');

    // removes additional characters from name
    let name = full.replace(extension, '')
        .replace(/[\.\-\_]/g, ' ') // removes ugly chars
        .replace(/\d{4}.*/g, '') // removes year
        .replace(/[()]/g, '') // removes wrappers
        .replace(/\s{2,}/g, ' ') // removes additional spaces
        .replace(/\s+$/g, ''); // removes spaces leading end

    return {
        name,
        year,
        extension,
        toString: function () {
            return `${ this.name } (${ this.year }) - ${ this.extension }`;
        }
    };
}

// gets all files from given folder
function getFolderFiles(folder) {
    // read file from folder
    let items = fs.readdirSync(folder, 'utf8');

    let files = [];
    // loop through files and files of folders
    items.forEach(item => {
        let address = path.join(folder, item);
        if(fs.lstatSync(address).isDirectory()) {
            files.push(...getFolderFiles(address));
        } else {
            files.push(address);
        }
    });

    return files;
}

function urlToBase64(url, callback) {
    let img = document.createElement('img');
    let canvas = document.createElement('canvas');

    img.src = url;
    img.onload = () => {
        canvas.height = img.height;
        canvas.width = img.width;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        callback(canvas.toDataURL());
    };
}

// gets content of given folder
function checkTargetContents(folder) {
    let files = getFolderFiles(folder).map(file => {
        let name = parseName(file);

        if(!allowedExtensions.includes(name.extension)) return;

        // console.log(name.toString());
        getFromAPI(name.name, name.year).then(data => {
            console.log(name.name, data);

            if(!data.Response) {
                console.error(`${ name.name } not found!`);
                return;
            }

            urlToBase64(data.Poster, src => {
                let movieCard = new MovieCard();
                movieCard.title = name.name;
                movieCard.image = src;
                movieCard.addEventListener('click', () => {
                    exec(`"${ file }"`);
                })
                document.querySelector('.movies-wrapper').append(movieCard);
            });

            // saveImage(data.Poster, path.basename(data.Poster), () => {
            //     console.log(`${ name.name } has been saved!`);
            // });
        });
    });
    
    fs.readdir(folder, (err, items) => {
        //handling error
        if (err) return;

        //listing all files using forEach
        let newMovies = [];
        items.forEach(item => {
            const itemPath = path.join(folder, item);
            const name = cleanName(folder, itemPath);

            // ignore file if extension is not allowed
            if(!name.isDirectory) {
                if(!allowedExtensions.includes(name.extension)) {
                    return;
                }
            }

            if(name.isDirectory) {
                console.log('->', fileFromFolder(itemPath));
            }

            // check for existence and add to newMovies if not
            const exists = movies.exists(m => m.name == name.name && m.year == name.year);
            if(!exists) {
                newMovies.push({
                    name: name.name,
                    year: name.year,
                    path: itemPath,
                });
            }
        });

        // add new movies to database
        if(newMovies.length) {
            movies.insert(newMovies);
        }
    });
}

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
