
const icons = require('../lib/icons');

let iconTemplate = document.createElement('template');
iconTemplate.innerHTML = `
    <div class="icon"></div>

    <style>
    .icon svg {
        display: block;
        fill: currentColor;
        height: 100%;
        width: 100%;
    }
    </style>
`;

class Icon extends HTMLElement {
    static get observedAttributes() {
        return ['icon', 'size', 'color'];
    }

    getSize() {
        return this.getAttribute('size') ? this.getAttribute('size') : '1em';
    }

    updateStyles() {
        const icon = this.querySelector('.icon');
        icon.style.height = this.getSize();
        icon.style.width = this.getSize();
        icon.style.color = this.getAttribute('color') || 'currentColor';
    }

    getIcon() {
        return this.icon ? icons[this.icon] : '';
    }

    constructor() {
        super();

        this.append(iconTemplate.content.cloneNode(true));
    }

    attributeChangedCallback(name) {
        switch(name) {
            case 'icon':
                this.querySelector('.icon').innerHTML = this.getIcon();
                break;
            case 'size':
            case 'color':
                this.updateStyles();
                break;
        }
    }

    get icon() { return this.getAttribute('icon'); }
    set icon(value) { this.setAttribute('icon', value); }

    get size() { return this.getAttribute('size'); }
    set size(value) { this.setAttribute('size', value); }

    get color() { return this.getAttribute('color'); }
    set color(value) { this.setAttribute('color', value); }

    connectedCallback() {
        this.querySelector('.icon').innerHTML = this.getIcon();
        this.updateStyles();
    }
}

window.customElements.define('i-con', Icon);
