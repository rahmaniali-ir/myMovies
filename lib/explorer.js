const parseName = require('./name-parser');

async function getFromAPI(title, year) {
    // TODO: get apiKey from settings
    title = title.replace(/\s/g, '+');
    const response = await fetch(`http://www.omdbapi.com/?t=${ title }&y=${ year }&apikey=${ apiKey }`);
    return await response.json();
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

function checkForMovie(file) {
    return new Promise((resolve, reject) => {
        const name = parseName(file);
    
        // ignore file if it's already saved
        if(isMovieSaved(name)) {
            // TODO: handle moved movies
            resolve(false);
            return;
        }
        
        // get movie's information's
        getFromAPI(name.name, name.year).then(result => {
            // save movie with default information's if not available
            if(result.Response == 'False') {
                insertMovie({ name: name.name, year: name.year, path: file });
                resolve(1);
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

                resolve(1);
            });
        });
    });
}

function checkForFiles(folder) {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(folder)) {
            reject(new Error('Path does not exists'));
        }

        // Get allowed files only
        let files = getFolderFiles(folder).filter(f => isFileAllowed(f));
        let promises = [];

        files.forEach(file => promises.push(checkForMovie(file)));

        Promise.all(promises).then(values => {
            let newMovies = values.reduce((prev, curr) => prev + (curr ? 1 : 0), 0);
            resolve(newMovies);
        });
    });
}

function checkTargetFolders() {
    return new Promise((resolve, reject) => {
        // check all files for existence and add them to database if not
        let targets = targetFolders.data;
        let promises = [];
        
        targets.forEach(target => {
            promises.push(checkForFiles(target.path));
        });

        Promise.all(promises).then(values => {
            // add up new movies count from all folders
            let newMovies = values.reduce((prev, curr) => prev + curr, 0);
            
            resolve(newMovies);
        });
    });
}

module.exports = {
    checkTargetFolders,
    saveImage,
};
