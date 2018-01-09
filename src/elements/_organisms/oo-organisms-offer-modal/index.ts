import {html} from 'lit-html'
import render from '../../../lib/render'
import ooModal from '../../oo-modal'
import define from '../../../lib/define'

define('oo-modal', ooModal)

const ATTR = {
	DATA_OPEN: 'data-open'
}
const asBoolean = (data: string): boolean => {
	switch(data) {
		case 'enabled':
			return true
		case 'disabled':
			return false
		default:
			return false
	}
}

export default class extends HTMLElement {
	state: {
		open: boolean
	}

	static get observedAttributes() {
		return [ATTR.DATA_OPEN]
	}

	constructor() {
		super()
		const open = asBoolean(this.getAttribute(ATTR.DATA_OPEN))
		this.state = {open}
		this.render()
	}

	attributeChangedCallback(attr, prev, next) {
		this.state.open = asBoolean(next)
		this.render()
	}

	html(open) {
		return html`
		<style>
			:host {
				display: block;
			}
		</style>
		<oo-modal data-open$=${open ? 'enabled' : 'disabled'}>
			<div slot=body>WIP</div>
		</oo-modal>
		`
	}

	render() {
		render(this.html(this.state.open), this)
	}
}
