
const template = document.createElement('template');
template.innerHTML = `
    <style>
    .movie {
        cursor: pointer;
        perspective: 500px;
    }
    
    .movie .image {
        border-radius: 4px;
        height: 200px;
        pointer-events: none;
        position: relative;
        transition: all .3s ease;
        width: 100%;
    }
    
    .movie:hover .image {
        transform: rotateX(15deg) translateY(-5px);
    }
    
    .movie .image::after {
        border-radius: inherit;
        box-shadow: inset 0 -5px 10px transparent, 0 0 0 #3333;
        content: '';
        display: block;
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        transition: inherit;
        width: 100%;
        z-index: 2;
    }
    
    .movie:hover .image::after {
        box-shadow: inset 0 -5px 10px #fff8, 0 5px 10px #3333;
    }
    
    .movie .image img {
        border-radius: inherit;
        display: block;
        height: 100%;
        object-fit: cover;
        position: 1;
        width: 100%;
        z-index: 1;
    }
    
    .movie h1 {
        font-size: 16px;
        margin: 0;
    }
    </style>
    <div class="movie">
        <div class="image">
            <img>
        </div>
        <h1 class="title"></h1>
    </div>
`;

class MovieCard extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'image'];
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(template.content.cloneNode(true));

        this.shadowRoot.querySelector('.title').textContent = this.getAttribute('title');
        this.shadowRoot.querySelector('.image img').textContent = this.getAttribute('image');
    }

    setTextContent(selector, value) {
        this.shadowRoot.querySelector(selector).textContent = value;
    }

    setImage(selector, value) {
        this.shadowRoot.querySelector(selector).src = value;
    }

    attributeChangedCallback(name) {
        switch(name) {
            case 'title':
                this.setTextContent('.title', this.getAttribute('title'));
                break;
            case 'image':
                this.setImage('.image img', this.getAttribute('text'));
                break;
        }
    }

    get title() { return this.getAttribute('title'); }
    set title(value) { this.setTextContent('.title', value); }

    get image() { return this.getAttribute('image'); }
    set image(value) { this.setImage('.image img', value); }
}

window.customElements.define('movie-card', MovieCard);
