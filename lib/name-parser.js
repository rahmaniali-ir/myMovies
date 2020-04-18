
const topLevelDomains = [
    'biz',
    'club',
    'com',
    'co',
    'film',
    'gov',
    'in',
    'info',
    'io',
    'ir',
    'me',
    'mobi',
    'movie',
    'net',
    'org',
    'pro',
    'tv',
    'wiki',
    'xyz',
].join('|');
const urlRegEx = new RegExp(`\\b[a-z]+\\.(${ topLevelDomains })\\b`, 'gi');

const redundantWords = [
    'FardaDownload',
    '30nama',
    'HeyDL',

    '720p',
    '1080p',
    'x264',
    'bluray',
    'WEBRip',
    'BrRip',
    'hd',
    'AC3',
    'MiLLENiUM',

    'YIFY',

    'DUBBED',
    'farsi',
    'fa',
    'persian',
].join('|');
const redundantWordsRegEx = new RegExp(`\\b(${ redundantWords })\\b`, 'gi');

function parseName(file) {
    // removes parent from path to get the name
    let original = path.basename(file);
    let full = original;
    
    // removes URLs
    full = full.replace(urlRegEx, '');

    // removes redundant information
    full = full.replace(redundantWordsRegEx, '');
    
    // remove numbering, min: 1 digit, max: 3 digits
    full = full.replace(/^\(?[0-9]{1,3}\s?[-_)]+/g, '');
    
    // remove invalid numbers
    full = full.replace(/[0-9]{5,}/g, '');

    // finding year
    const yearRegEx = /[0-9]{4}/g;
    const yearMatches = full.match(yearRegEx);
    const year = yearMatches && Number(yearMatches.pop()) || '';

    // find extension
    let extension = full.split('.').reverse()[0];

    // removes redundant characters from name
    let name = full.replace(extension, '')
        .replace(/[-._]/g, ' ') // removes ugly chars
        .replace(year, '') // removes year
        .replace(/[()]/g, '') // removes wrappers
        .replace(/\s{2,}/g, ' ') // removes redundant spaces
        .replace(/~%\^@#\$&=`\{\},!/g, '') // removes redundant chars
        .replace(/^[-\s._]+/g, '') // removes starting redundant chars
        .replace(/[-\s._]+$/g, ''); // removes redundant chars leading end

    return {
        name,
        year,
        extension,
        path: file,
        original,
        toString: function(pattern = '') {
            if(!pattern) {
                pattern = '$n ($y) - $e';
            }

            let str = pattern;
            str = str.replace('$n', this.name);
            str = str.replace('$y', this.year);
            str = str.replace('$e', this.extension);
            str = str.replace('$p', this.path);
            str = str.replace('$o', this.original);

            return str;
        },
    };
}

module.exports = parseName;