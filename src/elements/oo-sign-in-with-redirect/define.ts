import stop from '../../lib/stop-when-unsupported'
import define from '../../lib/define'
import el from './index'

if (stop() === false) {
	define('oo-sign-in-with-redirect', el)
}
