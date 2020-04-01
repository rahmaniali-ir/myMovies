
const fs = require('fs');

class Random {
    static getRandom(charset = '0123456789', length = 6) {
        let str = '';

        for(let i = 0; i < length; i++)
            str += charset[Math.floor(Math.random() * (charset.length - 1))];
        
        return str;
    }

    // returns a random value which there is not inside the given list
    static getUnique(charset = '0123456789', length = 6, list = []) {
        do {
            let rand = Random.getRandom(charset, length);

            if(!list.includes(rand)) {
                return rand;
            }
        } while (true);
    }
}

class Table {
    bank = null;
    name = '';

    constructor(bank, name) {
        this.bank = bank;
        this.name = name;
    }

    insert(data) {
        this.bank.addToTable(this.name, Array.isArray(data) ? data : [data]);
        return this;
    }

    remove(where) {
        this.bank.removeFromTable(this.name, where);
        return this;
    }

    update(where, value) {
        this.bank.updateTable(this.name, where, value);
        return this;
    }

    select(where) {
        return this.bank.getFromTable(this.name, where);
    }

    exists(where) {
        return this.select(where).length > 0;
    }

    empty() {
        this.bank.emptyTable(this.name);
        return this;
    }

    get data() {
        return this.bank.tableData(this.name);
    }

    get length() {
        return this.data.length;
    }
}

class Bank {
    file = '';
    tables = [];

    constructor(fileName) {
        if(fs.existsSync(fileName)) {
            this.file = fileName;
        }
        else {
            fs.writeFile(fileName, JSON.stringify([]), (err) => {
                if(!err) {
                    this.file = fileName;
                }
            });
        }

        this.pullTables();
    }

    // reads data from file and parse it
    pullTables() {
        let data = fs.readFileSync(this.file, 'utf8');
        this.tables = JSON.parse(data);
    }

    // writes data to file
    pushTables() {
        fs.writeFile(this.file, JSON.stringify(this.tables), (err) => {
            if(err) return;
        });
    }

    tableFromName(name) {
        return this.tables.find(t => t.header && t.header.name == name) || null;
    }

    tableExists(name) {
        return this.tables.some(t => t.header && t.header.name == name);
    }

    // creates table if does not exists
    createTable(name) {
        if(this.tableExists(name)) return;

        this.tables.push({
            header: {
                name: name
            },
            data: []
        });

        this.pushTables();
    }

    // get table and create it if does not exists
    table(name) {
        if(!this.tableExists(name)) {
            this.createTable(name);
        }

        return new Table(this, name);
    }

    // gets data from table
    tableData(name) {
        let table = this.tableFromName(name);
        let data = [];

        if(table) {
            data = table.data;
        }

        return data;
    }

    // gets just _id fields of the table data
    getIdsFromTable(name) {
        let table = this.tableFromName(name);
        let data = [];

        if(table) {
            data = table.data.filter(d => d._id != undefined).map(d => d._id || '');
        }

        return data;
    }

    addToTable(name, records) {
        this.tables = this.tables.map(t => {
            if(t.header && t.header.name == name) {
                records.forEach(record => {
                    record._id = Random.getUnique('0123456789', 6, this.getIdsFromTable(name));
                    t.data.push(record);
                });
            }

            return t;
        });

        this.pushTables();
    }

    removeFromTable(name, where) {
        this.tables = this.tables.map(t => {
            if(t.header && t.header.name == name) {
                t.data = t.data.filter(d => { return !where(d) });
            }

            return t;
        });

        this.pushTables();
    }

    // updates fields which returns true for where() and writes the result of value()
    updateTable(name, where, value) {
        this.tables = this.tables.map(t => {
            if(t.header && t.header.name == name) {
                t.data = t.data.filter(d => {
                    if(where(d)) {
                        return value(d);
                    } else {
                        return d;
                    }
                });
            }
            
            return t;
        });

        this.pushTables();
    }

    // get only fields that where() returns true for
    getFromTable(name, where) {
        let table = this.tableFromName(name);
        let data = [];

        if(table) {
            data = table.data.filter(d => { return where(d) });
        }

        return data;
    }

    // deletes the table
    dropTable(name) {
        this.tables = this.tables.filter(t => t.header && t.header.name != name);

        this.pushTables();
    }

    // removes all fields of the table
    emptyTable(name) {
        this.tables = this.tables.map(t => {
            if(t.header && t.header.name == name) {
                t.data = [];
            }

            return t;
        });

        this.pushTables();
    }
}

module.exports = Bank;
