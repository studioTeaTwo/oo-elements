import {html} from 'lit-html'
import render from '../../lib/render'
import define from '../../lib/define'
import summary from '../oo-project-summary'
import messages from '../oo-project-messages'
import form from '../oo-message-form'
import store from '../../lib/local-storage'
import {OOExtensions, OOExtensionMap} from '../../d/oo-extension'

define('oo-project-summary', summary)
define('oo-project-messages', messages)
define('oo-message-form', form)

const ATTR = {
	DATA_UID: 'data-uid'
}

const projectUid: WeakMap<object, string> = new WeakMap()
const projectOfferer: WeakMap<object, string> = new WeakMap()

export default class extends HTMLElement {
	static get observedAttributes() {
		return [ATTR.DATA_UID]
	}

	constructor() {
		super()
	}

	attributeChangedCallback(attr, prev, next) {
		if (prev === next) {
			return
		}
		projectUid.set(this, next)
		this.render()
	}

	html(user: string, uid: string, extensions: OOExtensions) {
		const strExts = JSON.stringify(extensions)
		return html`
		<style>
			oo-project-summary {
				margin-bottom: 2rem;
				border-bottom: 0.5px solid #ccc;
			}
		</style>
		<oo-project-summary data-uid$='${uid}' on-projectupdated='${e => this.onProjectFetched(e)}'></oo-project-summary>
		<oo-project-messages data-iam$='${user ? user : ''}' data-uid$='${uid}'></oo-project-messages>
		<oo-message-form data-iam$='${uid}' data-extensions$='${strExts}'></oo-message-form>
		`
	}

	render() {
		const user = store.uid
		const extensions = [{
			key: 'project',
			value: projectUid.get(this)
		}, {
			key: 'author',
			value: user
		}, {
			key: 'users',
			value: [user, projectOfferer.get(this)]
		}]
		render(this.html(user, projectUid.get(this), extensions), this)
	}

	onProjectFetched(e: CustomEvent) {
		const {detail} = e
		const maped: OOExtensionMap = detail.mapedExtensions
		if (maped.has('author')) {
			projectOfferer.set(this, maped.get('author'))
			this.render()
		}
	}
}