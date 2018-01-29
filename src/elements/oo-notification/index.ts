import {html} from 'lit-html'
import render from '../../lib/render'
import weakMap from '../../lib/weak-map'

type Type = 'error' | ''

const ATTR = {
	DATA_TYPE: 'data-type'
}
const EVENT = {
	SHOWN: new Event('shown'),
	HIDDEN: new Event('hidden')
}

const stateType = weakMap<Type>()

const asType = (data: string): Type => {
	if (data === 'error' || data === '') {
		return data
	}
	return ''
}

export default class extends HTMLElement {
	connectedCallback() {
		stateType.set(this, asType(this.getAttribute(ATTR.DATA_TYPE)))
		this.render()
	}

	disconnectedCallback() {
		this.dispatchEvent(EVENT.HIDDEN)
	}

	html(type: Type) {
		return html`
		<style>
			@import '../../style/_vars-input.css';
			:host {
				display: block;
			}
			main {
				padding: 1rem;
				z-index: 1001;
				animation-name: showNotification;
				animation-duration: 0.3s;
				animation-fill-mode: forwards;
				border-radius: 5px;
				background: whitesmoke;
				&.error {
					background: var(--rejected-background);
					color: white;
				}
			}
			@keyframes showNotification {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}
		</style>
		<main class$='${type}' on-click='${() => this.close()}'>
			<slot name=body></slot>
		</main>
		`
	}

	render() {
		render(this.html(stateType.get(this)), this)
		this.dispatchEvent(EVENT.SHOWN)
	}

	close() {
		this.parentElement.removeChild(this)
	}
}
