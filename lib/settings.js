
const defaults = require('./defaults');

const settings = {
    title: 'My Movies',
};

// change items if settings is defined or set default value
let finalSettings = { ...defaults };
for(key in finalSettings) {
    if(settings[key])
        finalSettings[key] = settings[key];
}

// add settings that have no default value
for(key in settings) {
    if(!finalSettings[key])
        finalSettings[key] = settings[key];
}

module.exports = finalSettings;
