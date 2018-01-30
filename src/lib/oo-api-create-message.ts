import api from '../lib/oo-api'
import {OOAPIResult} from '../d/oo-api'
import {OOExtension} from '../d/oo-extension'
import {OOMessage} from '../d/oo-message'
import {MessageOptionsPost} from '../d/oo-options-message'
import createExtensions from './create-extensions'

export default async (options: MessageOptionsPost, test?: boolean): Promise<OOAPIResult<OOMessage>> => {
	if (typeof test === 'boolean') {
		if (test === false) {
			return {
				response: {message: 'error'},
				headers: new Headers(),
				status: 500
			}
		}
	}
	const extensions: Array<OOExtension> = createExtensions(options)

	const ooapiRes = await api<OOMessage>({
		resource: 'messages',
		method: 'POST',
		body: {
			Extensions: extensions
		}
	})

	return ooapiRes
}
