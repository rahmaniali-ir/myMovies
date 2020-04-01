const dataStore = require('nedb')

function Table(path) {
    this.db = new dataStore(path);
    this.db.loadDatabase();

    this.insert = function(data) {
        this.db.insert(data);
    };

    this.remove = function(data) {
    }
}

module.exports = Table;
