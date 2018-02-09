import {repeat} from 'lit-html/lib/repeat'
import {html, render} from '../../lib/html'
import getUser from '../../lib/oo-api-get-user'
import isSuccess from '../../lib/is-api-success'
import toMap from '../../lib/extensions-to-map'
import lineBreak from '../../lib/line-break'
import empty from '../oo-empty'
import define from '../../lib/define'
import weakMap from '../../lib/weak-map'
import getPicture from '../../lib/get-picture'

define('oo-empty', empty)

const ATTR = {
	DATA_IAM: 'data-iam'
}
const EVENT = {
	USER_UPDATED: new Event('userupdated')
}

const iam = weakMap<string>()
const name = weakMap<string>()
const picture = weakMap<string>()
const bio = weakMap<string>()
const found = weakMap<boolean>()

export default class extends HTMLElement {
	static get observedAttributes() {
		return [ATTR.DATA_IAM]
	}

	attributeChangedCallback(attr, prev, next) {
		if (prev === next || !next) {
			return
		}
		iam.set(this, next)
		this.fetchUserData()
	}

	html(f: boolean, uid: string, n: string, p: string, b: string) {
		if (f === false) {
			return html`
			<oo-empty></oo-empty>
			`
		}
		const img = p ? p : ''
		const bi = lineBreak(b)
		return html`
		<style>
			@import '../../style/_vars-font-family.css';
			:host {
				display: block;
			}
			.container {
				color: #333;
			}
			p {
				margin: 0;
			}
			a {
				color: black;
				font-weight: 700;
			}
			article {
				margin-bottom: 1rem;
			}
			.name,
			.bio {
				font-family: var(--font-family);
			}
			.name {
				font-weight: 700;
				font-size: 1.8rem;
				word-break: break-all;
				line-height: 1.8rem;
				&.empty {
					&::after {
						content: '.';
						visibility: hidden;
					}
				}
			}
			.bio {
				p {
					margin-bottom: 1rem;
					font-size: 1rem;
					line-height: 1.4rem;
				}
			}
			.picture {
				background-size: cover;
				background-color: whitesmoke;
				border-radius: 10px;
				&::after {
					content: '';
					display: block;
					padding-top: 100%;
				}
			}
			header {
				display: flex;
				align-items: center;
				margin-bottom: 1rem;
				.picture {
					width: 20%;
				}
				.name {
					width: 80%;
					margin-left: 1rem;
				}
			}
		</style>
		<div class=container>
			<header>
				<div class=picture style$='background-image: url(${getPicture(img)})'></div>
				<p class$='name ${n ? '' : 'empty'}'>${n}</p>
			</header>
			<article>
				<p><a href$='/${uid}/projects'>Public questions</a></p>
			</article>
			<div class=bio>
				${repeat(bi, bios => html`<p>${bios}</p>`)}
			</div>
		</div>
		`
	}

	render() {
		render(this.html(found.get(this), iam.get(this), name.get(this), picture.get(this), bio.get(this)), this)
	}

	async fetchUserData() {
		const res = await getUser(iam.get(this))
		if (isSuccess(res.status) && Array.isArray(res.response)) {
			const [item] = res.response
			const ext = toMap(item)
			found.set(this, true)
			name.set(this, ext.get('name'))
			picture.set(this, ext.get('picture'))
			bio.set(this, ext.get('bio'))
			this.render()
		} else {
			found.set(this, false)
			name.set(this, '')
			picture.set(this, '')
			bio.set(this, '')
			this.render()
		}
		this.dispatchEvent(EVENT.USER_UPDATED)
	}
}
