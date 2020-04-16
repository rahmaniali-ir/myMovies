
const notificationTemplate = document.createElement('template');
notificationTemplate.innerHTML = `
    <div class="notification">
        <div class="glyph"><i-con></i-con></div>
        <h1></h1>
        <p></p>
        <div class="close"><i-con icon="close" size="8px" color="black" /></div>
    </div>

    <style>
    .notification {
        background-color: #fff4;
        backdrop-filter: blur(4px);
        border-radius: 8px;
        box-shadow: inset 0 -2px 3px #fff1, 0 5px 10px #0001;
        color: #1c1c1c;
        left: 8px;
        opacity: 0;
        overflow: hidden;
        padding: 16px 32px;
        position: fixed;
        top: calc(var(--title-bar) + 8px);
        transform: translateX(-30%);
        transition: all .5s ease;
    }

    .notification.show {
        opacity: 1;
        transform: translateX(0);
    }

    .notification.information { color: #2a66d4 }
    .notification.success { color: #39b86f }
    .notification.warning { color: #c9ae1b }
    .notification.critical { color: #cf4747 }

    .notification::before,
    .notification::after {
        border-radius: inherit;
        display: block;
        content: '';
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    .notification::before {
        background-color: currentColor;
        opacity: .4;
        transition: all .5s ease;
        z-index: 0;
    }

    .notification::after {
        background-image: url(../assets/images/noise.jpg);
        background-repeat: repeat;
        filter: blur(3px);
        opacity: .3;
        transform: scale(1.2);
        z-index: 1;
    }

    .glyph {
        align-items: center;
        animation-delay: 1s;
        animation-timing-function: ease;
        animation-fill-mode: forwards;
        color: inherit;
        display: flex;
        font-size: 5em;
        justify-content: center;
        left: 0;
        opacity: 0;
        margin-right: .5em;
        position: absolute;
        top: 50%;
        z-index: 2;
    }

    @keyframes notification-information {
        0% {
            opacity: 0;
            transform: translate(-100%, -48%) rotate(-90deg) scale(1.2);
        }

        100% {
            opacity: 1;
            transform: translate(-27%, -48%) rotate(-25deg) scale(1.2);
        }
    }

    .notification.information .glyph {
        animation-name: notification-information;
        animation-duration: 1s;
        transform: translate(-100%, -48%) rotate(-90deg) scale(1.2);
    }

    @keyframes notification-warning {
        0% {
            opacity: 0;
            transform: translate(33%, 13%) rotate(-30deg) scale(1.2);
        }

        100% {
            opacity: 1;
            transform: translate(-23%, -43%) rotate(-30deg) scale(1.2);
        }
    }

    .notification.warning .glyph {
        animation-name: notification-warning;
        animation-duration: .5s;
        transform: translate(33%, 13%) rotate(-30deg) scale(1.2);
    }

    @keyframes notification-critical {
        0% {
            opacity: 0;
            transform: translate(-60%, -43%) rotate(-30deg) scale(1.2);
        }

        100% {
            opacity: 1;
            transform: translate(-20%, -43%) rotate(30deg) scale(1.2);
        }
    }

    .notification.critical .glyph {
        animation-name: notification-critical;
        animation-duration: 1s;
        transform: translate(-60%, -43%) rotate(-30deg) scale(1.2);
    }

    @keyframes notification-success {
        0% {
            opacity: 0;
            transform: translate(0%, -50%) rotate(-20deg) scale(1.5);
        }

        100% {
            opacity: 1;
            transform: translate(0%, -50%) rotate(-20deg) scale(1.2);
        }
    }

    .notification.success .glyph {
        animation-name: notification-success;
        animation-duration: .5s;
        transform: translate(0%, -50%) rotate(-20deg) scale(1.5);
    }

    h1, p {
        color: #1c1c1c;
        position: relative;
        z-index: 3;
    }

    h1 {
        font-size: .8em;
        font-weight: normal;
        margin: 0 0 .5em;
        opacity: .8;
    }

    p {
        font-size: .9em;
        font-weight: bold;
        margin: 0;
        opacity: .9;
    }

    .close {
        cursor: pointer;
        opacity: 0;
        position: absolute;
        right: 8px;
        top: 8px;
        transition: all .3s ease;
        z-index: 4;
    }

    .notification:hover .close {
        opacity: .6;
    }
    </style>
`;

class Notif extends HTMLElement {
    _duration = null;

    static get observedAttributes() {
        return ['name', 'text', 'status', 'duration'];
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(notificationTemplate.content.cloneNode(true));
    }

    attributeChangedCallback(name) {
        switch(name) {
            case 'name':
                this.shadowRoot.querySelector('h1').textContent = this.getAttribute('name');
                break;
            case 'text':
                this.shadowRoot.querySelector('p').textContent = this.getAttribute('text');
                break;
            case 'status':
                this.shadowRoot.querySelector('.notification').classList = 'notification ' + this.getAttribute('status');
                this.shadowRoot.querySelector('.glyph i-con').icon = this.getAttribute('status');
                break;
            case 'duration':
                clearTimeout(this._duration);

                if(!this.duration) break;
                
                this._duration = setTimeout(() => {
                    this.close();
                }, this.duration);
                break;
        }
    }

    get name() { return this.getAttribute('name'); }
    set name(value) { this.setAttribute('name', value); }

    get text() { return this.getAttribute('text'); }
    set text(value) { this.setAttribute('text', value); }

    get status() { return this.getAttribute('status'); }
    set status(value) { this.setAttribute('status', value); }

    get duration() { return this.getAttribute('duration') || 0; }
    set duration(value) { this.setAttribute('duration', isNaN(value) ? 0 : value * 1000); }

    close() {
        this.shadowRoot.querySelector('.notification').classList.remove('show');
        this.shadowRoot.querySelector('.notification').style.pointerEvents = 'none';
        setTimeout(() => this.remove(), 500);
    }

    connectedCallback() {
        setTimeout(() => this.shadowRoot.querySelector('.notification').classList.add('show'), 50);
        
        this.shadowRoot.querySelector('.close').addEventListener('click',() => this.close());
    }
}

window.customElements.define('notif-box', Notif);
