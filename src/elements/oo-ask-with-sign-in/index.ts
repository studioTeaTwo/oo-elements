import {html, render} from '../../lib/html'
import stepSignIn from '../_organisms/oo-organisms-ask-step-sign-in'
import askForm from '../oo-ask-form'
import define from '../../lib/define'
import createProject from '../../lib/oo-api-create-project'
import weakMap from '../../lib/weak-map'
import {HTMLElementEventChangeAsk, ProjectCreatedDetail, ProjectCreated} from '../../type/event'
import {Scope} from '../../type/scope'
import {Currency} from '../../type/currency'

define('oo-organisms-ask-step-sign-in', stepSignIn)
define('oo-ask-form', askForm)

type SignInFlow = 'popup' | 'redirect'

interface Options {
	uid: string,
	auth: boolean,
	sender: string,
	flow: SignInFlow
}

const ATTR = {
	DATA_IAM: 'data-iam',
	DATA_SIGN_IN_FLOW: 'data-sign-in-flow'
}
const EVENT = {
	PROJECT_CREATED: (detail: ProjectCreatedDetail): ProjectCreated => new CustomEvent('projectcreated', {detail}),
	PROJECT_CREATION_FAILED: detail => new CustomEvent('projectcreationfailed', {detail})
}

const stateIam = weakMap<string>()
const stateMessage = weakMap<string>()
const stateOfferer = weakMap<string>()
const stateScope = weakMap<Scope>()
const stateCurrency = weakMap<Currency>()
const stateAuthorized = weakMap<boolean>()
const stateSignInFlow = weakMap<SignInFlow>()

const validation = (el: HTMLElement): boolean => {
	const users = [stateIam.get(el), stateOfferer.get(el)]
	if (users.some(i => i === undefined)) {
		return false
	}
	const body = stateMessage.get(el)
	if (body === undefined || body.match(/./) === null) {
		return false
	}
	const author = stateOfferer.get(el)
	if (author === undefined) {
		return false
	}
	return true
}
const asSignInFlow = (d: string): SignInFlow => {
	if (d === 'popup' || d === 'redirect') {
		return d
	}
	return 'popup'
}

export default class extends HTMLElement {
	static get observedAttributes() {
		return [ATTR.DATA_IAM, ATTR.DATA_SIGN_IN_FLOW]
	}

	constructor() {
		super()
		stateAuthorized.set(this, false)
	}

	attributeChangedCallback(attr, prev, next) {
		if (prev === next || !next) {
			return
		}
		switch(attr) {
			case ATTR.DATA_IAM:
				stateIam.set(this, next)
				break
			case ATTR.DATA_SIGN_IN_FLOW:
				stateSignInFlow.set(this, asSignInFlow(next))
				break
			default:
				break
		}
		this.render()
	}

	html(opts: Options) {
		const {uid, auth, sender, flow} = opts
		const step = (() => {
			if (sender !== undefined && sender !== '') {
				return 'submit'
			}
			return auth ? 'signin' : 'ask'
		})()

		return html`
		<style>
			@import '../../style/_reset-button.css';
			@import '../../style/_vars-font-family.css';
			@import '../../style/_vars-color-yellow.css';
			:host {
				display: block;
			}
			:root {
				--authorization: white;
				--submit: color(var(--yellow) blend(red 10%));
			}
			oo-ask-form {
				padding: 2rem 1rem;
				width: 100%;
				box-sizing: border-box;
			}
			button {
				width: 100%;
				padding: 1rem;
				font-size: 1.2rem;
				border-radius: 5px;
			}
			.steps {
				width: 100%;
				overflow: hidden;
				ul {
					width: 300%;
					display: flex;
					margin: 0;
					padding: 0;
					list-style: none;
					transition: transform 0.5s;
					&.ask {
						transform: translateX(0);
					}
					&.signin {
						transform: translateX(calc(-100% / 3));
					}
					&.submit {
						transform: translateX(calc(-100% / 3 * 2));
					}
				}
			}
			.step {
				width: 100%;
				padding: 2rem 1rem;
				.authorization {
					border: 0.5px solid #ccc;
					background: var(--authorization);
					&:hover {
						background: color(var(--authorization) blackness(+10%));
					}
				}
				.signin {}
				.submit {
					border: 0.5px solid color(var(--submit) blackness(+10%));
					background: var(--submit);
					&:hover {
						background: color(var(--submit) blackness(+10%));
					}
				}
			}
			.description {
				margin: 1rem 0;
				font-size: 0.8rem;
				font-family: var(--font-family);
			}
		</style>
		<oo-ask-form data-iam$='${uid}' on-changed='${e => this.onAskChanged(e)}'></oo-ask-form>
		<div class=steps>
			<ul class$='${step}'>
				<li class=step>
					<button class=authorization on-click='${() => this.onAuthorization()}'>Authenticate</button>
					<p class=description>Next step: Authenticate account with Google, Facebook or GitHub.</p>
				</li>
				<li class=step>
					<oo-organisms-ask-step-sign-in class=signin data-flow$='${flow}' on-signedin='${e => this.onSignedIn(e)}'></oo-organisms-ask-step-sign-in>
				</li>
				<li class=step>
					<button class=submit on-click='${() => this.createProject()}'>Ask</button>
					<p class=description>Just send it! In the case of a "Private", please pay the initial fee after being accepted by this person.</p>
				</li>
			</ul>
		</div>
		`
	}

	render() {
		render(this.html({
			uid: stateIam.get(this),
			auth: stateAuthorized.get(this),
			sender: stateOfferer.get(this),
			flow: stateSignInFlow.get(this)
		}), this)
	}

	onAskChanged(e: HTMLElementEventChangeAsk<HTMLElement>) {
		const {detail} = e
		const {message: m, scope, currency} = detail
		stateMessage.set(this, m)
		stateScope.set(this, scope)
		stateCurrency.set(this, currency)
	}

	onAuthorization() {
		stateAuthorized.set(this, true)
		this.render()
	}

	onSignedIn(e: CustomEvent) {
		const {detail} = e
		const {uid} = detail
		stateOfferer.set(this, uid)
		this.render()
	}

	async createProject() {
		if (validation(this) === false) {
			return
		}
		const users = [stateIam.get(this), stateOfferer.get(this)]
		const body = stateMessage.get(this)
		const author = stateOfferer.get(this)
		const scope = stateScope.get(this)
		const currency = stateCurrency.get(this)
		const project = await createProject({
			users,
			body,
			author,
			scope,
			currency,
			assignee: stateIam.get(this)
		})
		const {response} = project
		if (Array.isArray(response)) {
			this.dispatchEvent(EVENT.PROJECT_CREATED(project))
		} else {
			this.dispatchEvent(EVENT.PROJECT_CREATION_FAILED(project))
		}
	}
}
