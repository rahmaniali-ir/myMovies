
const template = document.createElement('template');
template.innerHTML = `
    <style>
        h1 {
            color: red;
        }
    </style>
    <div class="icon"></div>
    <div class="details">
        <div class="title"></div>
        <div class="text"></div>
    </div>
`;

class Notif extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'text'];
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(template.content.cloneNode(true));

        this.shadowRoot.querySelector('.title').textContent = this.getAttribute('title');
        this.shadowRoot.querySelector('.text').textContent = this.getAttribute('text');
    }

    setElement(selector, value) {
        this.shadowRoot.querySelector(selector).textContent = value;
    }

    attributeChangedCallback(name) {
        switch(name) {
            case 'title':
                this.setElement('.title', this.getAttribute('title'));
                break;
            case 'text':
                this.setElement('.text', this.getAttribute('text'));
                break;
        }
    }

    get title() { return this.getAttribute('title'); }
    set title(value) { this.setElement('.title', value); }

    get text() { return this.getAttribute('text'); }
    set text(value) { this.setElement('.text', value); }
}

window.customElements.define('notif-box', Notif);
