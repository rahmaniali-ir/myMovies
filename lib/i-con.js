
const icons = require('../lib/icons');

class Icon extends HTMLElement {
    static get observedAttributes() {
        return ['name', 'size'];
    }

    setIcon(name) {
        this.querySelector('.icon').innerHTML = icons[name] || '';
        this.querySelector('.icon svg').style.display = 'block';
    }

    getSize() {
        return this.getAttribute('size') ? this.getAttribute('size') + 'px' : '1em';
    }

    updateStyles() {
        let svg = this.querySelector('.icon svg');
        if(!svg) return;

        svg.style.height = this.getSize();
        svg.style.width = this.getSize();
        svg.style.fill = this.getAttribute('color') || 'currentColor';
    }

    constructor() {
        super();

        this.innerHTML = `<div class="icon"></div>`;

        this.updateStyles();
        this.setIcon(this.getAttribute('name'));
    }

    attributeChangedCallback(name) {
        switch(name) {
            case 'name':
                this.setIcon(this.getAttribute('name'));
            case 'size':
            case 'color':
                this.updateStyles();
                break;
        }
    }

    get name() { return this.getAttribute('name'); }
    set name(value) { this.setAttribute('name', value); }

    get size() { return this.getAttribute('size'); }
    set size(value) { this.setAttribute('size', value); }

    get color() { return this.getAttribute('color'); }
    set color(value) { this.setAttribute('color', value); }
}

window.customElements.define('i-con', Icon);
