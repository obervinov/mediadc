import Vue from 'vue'

import DirectoryPicker from '../components/DirectoryPicker.vue'

/**
 * Lightweight replacement for the @nextcloud/dialogs file picker:
 * lists only directories and never requests previews.
 *
 * @param {string} title modal title
 * @return {Promise<string>} path of the chosen directory, rejects on cancel
 */
const pickDirectory = (title) => {
	return new Promise((resolve, reject) => {
		const container = document.createElement('div')
		document.body.appendChild(container)
		const vm = new Vue({
			render: h => h(DirectoryPicker, {
				props: { title },
				on: {
					choose: path => {
						destroy()
						resolve(path)
					},
					cancel: () => {
						destroy()
						reject(new Error('Directory picker closed'))
					},
				},
			}),
		}).$mount(container)
		const destroy = () => {
			vm.$destroy()
			vm.$el.remove()
		}
	})
}

export { pickDirectory }
