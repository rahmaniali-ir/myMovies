
async function getFromAPI(title, year) {
    // TODO: get apiKey from settings
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
    let year = yearMatch && yearMatch[0] ? Number(yearMatch[0]) : '';
    if(year == 1080) year = '';

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
        path: file,
        toString: function() {
            return `${ this.name } (${ this.year }) - ${ this.extension }`;
        },
    };
}

// gets all files from given folder
function getFolderFiles(folder) {
    if(!folder) return [];

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

function isFileAllowed(file) {
    const extension = parseName(file).extension;
    return settings.allowedExtensions.includes(extension);
}

function isMovieSaved(movie) {
    return movies.exists(m => m.name == movie.name && m.year == movie.year);
}

function urlToBase64(url, callback) {
    if(!url || url.toLowerCase() == 'n/a') {
        callback('');
        return;
    }

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

function saveImage(url, name, callback) {
    urlToBase64(url, base64 => {
        fs.writeFile(name, base64, err => {
            if(!err)
                callback(name);
            else
                callback('');
        });
    });
}

function movieData(data) {
    settings.fields.forEach(field => {
        if(!data[field]) {
            data[field] = '';
        }
    });

    data['duration'] = Number(data['duration'].replace(' min', ''));
    
    return data;
}

function getImageAddress(name) {
    return path.join(__dirname, '../src/img/', `${ name.name } (${ name.year }).image`);
}

function insertMovie(data) {
    movies.insert(movieData(data));
}

let allMoviesCount = 0;
let allMoviesLength = undefined;
let newMoviesCount = 0;
let pendingMovies = 0;
function checkMoviesCount(callback) {
    if(allMoviesLength === undefined) return;

    if(allMoviesCount == allMoviesLength && pendingMovies <= 0) {
        callback(newMoviesCount);
        allMoviesCount = newMoviesCount = pendingMovies = 0;
        allMoviesLength = undefined;
    }
}

function checkForFiles(folder, callback) {
    let files = getFolderFiles(folder).filter(f => isFileAllowed(f));
    allMoviesLength = files.length;

    files.forEach(file => {
        const name = parseName(file);

        // ignore file if it's already saved
        if(isMovieSaved(name)) {
            allMoviesCount++;
            // TODO: handle moved movies

            checkMoviesCount(callback);
            return;
        }
        
        // get movie's information's
        pendingMovies++;
        getFromAPI(name.name, name.year).then(result => {
            // save movie with default information's if not available
            if(result.Response == 'False') {
                insertMovie({ name: name.name, year: name.year, path: file });
                return;
            }

            // save image and movie
            saveImage(result.Poster, getImageAddress(name), image => {
                insertMovie({
                    name: name.name,
                    year: name.year,
                    image,
                    path: file,
                    duration: result.Runtime,
                    genre: result.Genre,
                    director: result.Director,
                    actors: result.Actors,
                    summery: result.Plot,
                    country: result.Country,
                    meta: result.Metascore,
                    imdb: result.imdbRating,
                    imdbid: result.imdbID,
                    boxoffice: result.BoxOffice,
                    production: result.Production,
                    website: result.Website,
                });
            });
        }).finally(() => {
            allMoviesCount++;
            newMoviesCount++;
            pendingMovies--;
            checkMoviesCount(callback);
        });
    });

    return files;
}

function checkTargetFolders(callback) {
    // check all files for existence and add them to database if not
    let targets = targetFolders.data;
    let targetsCount = 0;
    let newMovies = 0;
    targets.forEach(target => {
        if(fs.existsSync(target.path)) {
            checkForFiles(target.path, addedMovies => {
                targetsCount++;
                newMovies += addedMovies;
                
                if(targetsCount == targets.length) {
                    callback(newMovies);
                }
            });
        }
    });
}

module.exports = {
    checkTargetFolders,
    saveImage,
};
