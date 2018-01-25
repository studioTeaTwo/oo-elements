import api from '../lib/oo-api'
import {OOAPIResult} from '../d/oo-api'
import {OOUserConnectStripe} from '../d/oo-user'

export default async (code: string, test?: boolean): Promise<OOAPIResult<OOUserConnectStripe>> => {
	const body = {code}
	const ooapiRes = await api<OOUserConnectStripe>({
		resource: 'users',
		pathParameter: `connect/stripe${test === false ? '/x' : ''}`,
		body,
		method: 'POST'
	})

	return ooapiRes
}
