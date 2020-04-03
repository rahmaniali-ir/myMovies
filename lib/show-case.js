
let showCaseTemplate = `
    <div class="show-case">
        <header>
            <nav>
                <button class="close">Close</button>
            </nav>

            <img class="back">

            <div class="content">
                <div class="poster">
                    <img>
                </div>

                <div class="details">
                    <div class="name">
                        <div></div>
                        <span></span>
                    </div>

                    <div class="tags">
                        <div class="tag imdb">
                            <label>IMDB</label>
                            <div>8.2</div>
                        </div>

                        <div class="tag duration">
                            <div>12</div>
                            <label>Minutes</label>
                        </div>

                        <div class="tag meta">
                            <label>META</label>
                            <div>87</div>
                        </div>

                        <div class="tag genre">
                            <label>Genre</label>
                            <div>Action, trailer</div>
                        </div>

                        <div class="tag watch">
                            <div>Watched</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <main>
            <button class="add">New</button>
            <slot />
        </main>
    </div>

    <style>
    .show-case {
        background-color: var(--background);
        height: 100vh;
        left: 0;
        opacity: 0;
        overflow: auto;
        pointer-events: none;
        position: absolute;
        top: 0;
        transform: translateY(5%);
        transition: all .3s ease;
        width: 100vw;
        z-index: 0;
    }

    .show-case.show {
        opacity: 1;
        pointer-events: all;
        transform: translateY(0);
    }

    header {
        height: 30vw;
        min-height: 400px;
        overflow: hidden;
        position: relative;
        z-index: 1;
    }
    
    nav {
        left: 3vw;
        padding: .8em 1.6em;
        position: absolute;
        top: 3vh;
        width: 100%;
        z-index: 2;
    }
    
    .back {
        filter: blur(8px);
        height: auto;
        left: 0;
        -webkit-mask-image: linear-gradient(to bottom, #fff, transparent 90%);
        mask-image: linear-gradient(to bottom, #fff, transparent 90%);
        max-height: 50vh;
        object-fit: cover;
        position: absolute;
        top: 0;
        transform: scale(1.2);
        width: 100%;
        z-index: 0;
    }
    
    .content {
        align-items: center;
        box-sizing: border-box;
        display: flex;
        height: 100%;
        padding: 10vh 10vw;
        position: relative;
        z-index: 1;
    }
    
    .poster {
        border-radius: 4px;
        height: 250px;
        position: relative;
        transform: perspective(500px) rotateY(15deg);
        width: 180px;
    }
    
    .poster::after {
        background-color: #000;
        border-radius: inherit;
        content: '';
        display: block;
        filter: blur(5px);
        height: 100%;
        left: 8px;
        opacity: .3;
        position: absolute;
        top: -5px;
        width: 100%;
        z-index: 0;
    }
    
    .poster img {
        border-radius: inherit;
        height: 100%;
        max-width: 190px;
        object-fit: cover;
        pointer-events: none;
        position: relative;
        z-index: 1;
    }
    
    .details {
        height: 100%;
        margin-left: 1em;
    }

    .name {
        font-size: 5vw;
        font-weight: bold;
        padding-top: 8px;
        position: relative;
        
    }

    .name div {
        opacity: .8;
    }

    .name > span {
        bottom: .1em;
        color: #fff0;
        font-size: 1.5em;
        left: 0;
        mask-image: linear-gradient(to bottom, #fff, transparent);
        -webkit-mask-image: linear-gradient(to bottom, #fff, transparent);
        opacity: .2;
        position: absolute;
        -webkit-text-stroke: 1px black;
        text-stroke: 1px black;
        white-space: nowrap;
        z-index: -1;
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        font-size: .8em;
        line-height: 1em;
    }

    .tag {
        align-items: center;
        background-color: #0005;
        border-radius: 4px;
        display: flex;
        margin-right: .5em;
        padding: .2em .4em;
    }

    .tag label {
        font-size: .8em;
        margin: 0 4px;
        opacity: .6;
    }
    
    .tag label:first-child::after {
        content: ':';
    }

    .tag div {
        font-weight: bold;
        opacity: .8;
    }

    .tag.imdb {
        background-color: #f6c719;
    }

    .tag.duration {
        background-color: #eee;
    }

    main {
    }
    </style>
`;

class ShowCase extends HTMLElement {
    static get observedAttributes() {
        return ['data'];
    }

    setTextContent(selector, value) {
        this.shadowRoot.querySelector(selector).textContent = value;
    }

    updateImage(image) {
        this.shadowRoot.querySelector('.back').src =
        this.shadowRoot.querySelector('.poster img').src =
        image;
    }

    updateName(name, year) {
        let nameEl = this.shadowRoot.querySelector('.name div');
        nameEl.textContent =
        this.shadowRoot.querySelector('.name > span').textContent =
        name;

        let yearEl = this.shadowRoot.querySelector('.name .year');
        if(!yearEl) {
            yearEl = document.createElement('span')
            yearEl.classList.add('year');
            nameEl.append(yearEl);
        }
        yearEl.textContent = year;
    }

    updateDuration(duration) {
        this.shadowRoot.querySelector('.duration div').textContent = duration;
    }

    render() {
        const data = this.data;
        this.updateImage(data.Poster);
        this.updateName(data.Title);

        let runtime = data.Runtime || '';
        this.updateDuration(runtime.replace(' min', ''));
    }

    show() {
        this.shadowRoot.querySelector('.show-case').classList.add('show');
    }

    hide() {
        console.info('Hide');
        this.shadowRoot.querySelector('.show-case').classList.remove('show');
    }

    constructor() {
        super();
        this.setAttribute('show', true);

        let template = document.createElement('template');
        template.innerHTML = showCaseTemplate;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(template.content.cloneNode(true));

        this.data = {};

        setTimeout(() => {
            this.show();
        } , 10);
    }

    attributeChangedCallback(name) {
        if(name === 'data') {
            this.render();
        }
    }

    get data() { return JSON.parse(this.getAttribute('data')); }
    set data(value) { this.setAttribute('data', JSON.stringify(value)); }

    connectedCallback() {
        this.shadowRoot.querySelector('.add').addEventListener('click', () => {
            let sc = new ShowCase();
            sc.image = './img/poster2.jpg';
            sc.name = 'The Mask';
            document.body.append(sc);
        });

        this.shadowRoot.querySelector('.close').addEventListener('click', () => {
            this.hide();
            setTimeout(() => {
                this.dispatchEvent(new Event('closed'));
            }, 300);
        });
    }
}

window.customElements.define('show-case', ShowCase);
