
// const defaults = require('./defaults');

let movieCardTemplate = `
    <div class="movie">
        <div class="image">
            <div class="watermark"></div>
            <img onerror="this.style.display='none'">
        </div>
        <button class="play"></button>
        <h1 class="name"></h1>
        <slot />
    </div>

    <style>
    @keyframes movie-in {
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .movie {
        animation: movie-in .5s ease forwards;
        opacity: 0;
        perspective: 500px;
        position: relative;
        transform: translateY(10%);
        width: 100%;
    }
    
    .movie .image {
        background: linear-gradient(to top left, #0002, #0000);
        background-color: #0001;
        border-radius: 4px;
        height: 200px;
        overflow: hidden;
        position: relative;
        transition: all .3s ease;
        width: 100%;
    }
    
    .movie:hover .image {
        transform: rotateX(15deg) translateY(-5px);
    }

    @media (min-width: 1280px) {
        .movie .image {
            height: 250px;
        }
    }
    
    .movie .image::after {
        border-radius: inherit;
        box-shadow: inset 0 -5px 10px transparent, 0 0 0 #3333;
        content: '';
        display: block;
        height: 100%;
        left: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        transition: inherit;
        width: 100%;
        z-index: 2;
    }
    
    .movie:hover .image::after {
        box-shadow: inset 0 -5px 10px #fff8, 0 5px 10px #3333;
    }

    .watermark {
        font-size: 3em;
        font-weight: bolder;
        left: 50%;
        line-height: 1em;
        opacity: .1;
        overflow: hidden;
        position: absolute;
        text-align: center;
        top: 50%;
        transform: translate(-50%, -50%) scale(2) rotate(-30deg);
        z-index: 0;
    }
    
    .movie .image img {
        border-radius: inherit;
        display: block;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
        position: relative;
        width: 100%;
        z-index: 1;
    }

    .play {
        all: unset;
        background-color: #0005;
        backdrop-filter: blur(6px);
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        height: 24px;
        opacity: 0;
        padding: 6px;
        position: absolute;
        right: 8px;
        top: 8px;
        transition: all .3s ease;
        width: 24px;
    }

    .movie:hover .play {
        opacity: 1;
    }

    .play::after {
        background-color: #eee;
        clip-path: polygon(
            0 0,
            100% 50%,
            0 100%
        );
        content: '';
        height: 100%;
        display: block;
        width: 100%;
    }
    
    .movie h1 {
        font-size: 16px;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    </style>
`;

class MovieCard extends HTMLElement {
    static get observedAttributes() {
        return ['name', 'image'];
    }

    setImage(selector, value) {
        this.shadowRoot.querySelector(selector).src = value;
    }

    constructor() {
        super();

        let template = document.createElement('template');
        template.innerHTML = movieCardTemplate;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(template.content.cloneNode(true));

        this.shadowRoot.querySelector('.name').textContent =
        this.shadowRoot.querySelector('.name').title =
        this.shadowRoot.querySelector('.watermark').textContent =
        this.getAttribute('name');

        this.setImage('.image img', this.getAttribute('image'));
        this.setAttribute('data', '{}');
    }

    attributeChangedCallback(name) {
        switch(name) {
            case 'name':
                this.shadowRoot.querySelector('.name').textContent =
                this.shadowRoot.querySelector('.name').title =
                this.shadowRoot.querySelector('.watermark').textContent =
                this.getAttribute('name');
                break;
            case 'image':
                this.setImage('.image img', this.getAttribute('image'));
                break;
        }
    }

    get name() { return this.getAttribute('name'); }
    set name(value) { this.setAttribute('name', value); }

    get image() { return this.getAttribute('image'); }
    set image(value) { this.setAttribute('image', value); }

    get data() { return JSON.parse(this.getAttribute('data')); }
    set data(value) { this.setAttribute('data', JSON.stringify(value)); }

    showMovie(e) {
        // TODO: make right click optional
        if(e.button == 2) {
            this.play();
            return;
        }

        let sc = new ShowCase();
        sc.data = this.data;
        sc.addEventListener('closed', () => {
            sc.remove();
        });
        document.body.append(sc);
    }

    play() {
        this.dispatchEvent(new Event('play'));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('.play').addEventListener('click', this.play);
        
        ['.image', '.name'].forEach(el => {
            this.shadowRoot.querySelector(el).addEventListener('mousedown', e => this.showMovie(e));
        });
    }
}

window.customElements.define('movie-card', MovieCard);
