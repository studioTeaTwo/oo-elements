import el from './index'
import define from '../../lib/define'
import insertElement from '../../lib/test/insert-element'
import getElement from '../../lib/test/get-element'
import removeElement from '../../lib/test/remove-element'
import sleep from '../../lib/test/sleep'
import event from '../../lib/test/event'

const ELEMENT = 'oo-forks'

describe(`<${ELEMENT}></${ELEMENT}>`, () => {
	before(() => {
		define(ELEMENT, el)
	})

	it('Mount on document', () => {
		insertElement(ELEMENT)
		expect(getElement(ELEMENT)[0]).to.be.ok()
	})

	describe('Fetch fork projects', () => {
		it('Fetch the fork projects from "data-uid" attribute value', async () => {
			const element = insertElement(ELEMENT, new Map([['data-uid', '79zGMA1b6q']]))
			await sleep(300)
			const items = element.shadowRoot.querySelectorAll('oo-project-messages')
			expect(items).to.have.length(1)

			const more = element.shadowRoot.querySelector('.paging > oo-atoms-button')
			expect(more).to.be.ok()
		})
	})

	describe('Load paging', () => {
		it('Fetch the old projects when click paging button', async () => {
			const element = insertElement(ELEMENT, new Map([['data-uid', '79zGMA1b6q']]))
			await sleep(300)
			const more = element.shadowRoot.querySelector('.paging > oo-atoms-button')
			event(more, 'clicked')
			await sleep(300)
			const items = element.shadowRoot.querySelectorAll('oo-project-messages')
			expect(items).to.have.length(2)
			expect(element.shadowRoot.querySelector('.paging > oo-atoms-button')).to.not.be.ok()
		})
	})

	after(() => {
		removeElement(ELEMENT)
	})
})
