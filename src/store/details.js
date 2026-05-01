/**
 * @copyright Copyright (c) 2021-2022 Andrey Borysenko <andrey18106x@gmail.com>
 *
 * @copyright Copyright (c) 2021-2022 Alexander Piskun <bigcat88@icloud.com>
 *
 * @author 2021-2022 Andrey Borysenko <andrey18106x@gmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

import Formats from '../mixins/Formats.js'

const createDetailsInfo = () => ({
	filessize: 0,
	filestotal: 0,
})

const state = {
	task: {},
	taskInfo: {
		exclude_directories: [],
		target_directories: [],
	},
	details: [],
	detailsTotal: 0,
	detailsInfo: createDetailsInfo(),
	itemsPerPage: 5,
	groupItemsPerPage: 10,
	detailsPage: 0,
	detailsFilterId: '',
	sorted: false,
	sortGroups: true,
}

const mutations = {
	setTask(state, task) {
		state.task = task
	},

	setTaskInfo(state, taskInfo) {
		state.taskInfo = taskInfo
	},

	setDetailsInfo(state, data) {
		state.detailsInfo.filessize = data.filessize
		state.detailsInfo.filestotal = data.filestotal
	},

	setDetails(state, details) {
		state.details = details
	},

	setDetailsTotal(state, detailsTotal) {
		state.detailsTotal = Number(detailsTotal)
	},

	deleteDetail(state, detail) {
		const newDetails = [...state.details]
		const detailIndex = newDetails.findIndex(d => d.group_id === detail.group_id)
		if (detailIndex !== -1) {
			newDetails.splice(detailIndex, 1)
		}
		state.details = newDetails
		state.detailsTotal = Math.max(0, state.detailsTotal - 1)
	},

	setDetailsListItemsPerPage(state, itemsPerPage) {
		state.itemsPerPage = Number(itemsPerPage)
	},

	setGroupItemsPerPage(state, itemsPerPage) {
		state.groupItemsPerPage = Number(itemsPerPage)
	},

	setSorted(state, sorted) {
		state.sorted = sorted
	},

	setSortGroups(state, sortGroups) {
		state.sortGroups = sortGroups
	},

	setDetailsPage(state, detailsPage) {
		state.detailsPage = Math.max(0, Number(detailsPage))
	},

	setDetailsFilterId(state, detailsFilterId) {
		state.detailsFilterId = detailsFilterId
	},

	resetDetailsState(state) {
		state.details = []
		state.detailsTotal = 0
		state.detailsInfo = createDetailsInfo()
		state.detailsPage = 0
		state.detailsFilterId = ''
		state.sorted = false
		state.sortGroups = true
	},
}

const getters = {
	task: state => state.task,
	taskInfo: state => state.taskInfo,
	details: state => state.details,
	detailsTotal: state => state.detailsTotal,
	detailsInfo: state => state.detailsInfo,
	itemsPerPage: state => state.itemsPerPage,
	groupItemsPerPage: state => state.groupItemsPerPage,
	detailsPage: state => state.detailsPage,
	detailsFilterId: state => state.detailsFilterId,
	sorted: state => state.sorted,
	sortGroups: state => state.sortGroups,
}

const actions = {
	async getTaskDetails(context) {
		const taskId = context.rootState.route.params.taskId
		return axios.get(generateUrl(`/apps/mediadc/api/v1/tasks/${taskId}`), {
			params: {
				limit: context.state.itemsPerPage,
				page: context.state.detailsPage,
				sortGroups: context.state.sortGroups,
				sorted: context.state.sorted,
				filterId: context.state.detailsFilterId,
			},
		}).then(res => {
			if ('success' in res.data && res.data.success) {
				context.commit('setTask', res.data.collectorTask)
				context.commit('setDetails', res.data.collectorTaskDetails)
				context.commit('setDetailsTotal', res.data.collectorTaskDetailsTotal ?? res.data.collectorTaskDetails.length)

				if (Formats.methods.getStatusBadge(context.state.task) === 'finished'
					&& context.state.detailsInfo.filestotal === 0 && context.state.detailsInfo.filessize === 0) {
					context.dispatch('getDetailFilesTotalSize')
				}
			}
			return res
		})
	},

	async getTaskInfo(context) {
		return axios.get(generateUrl(`/apps/mediadc/api/v1/tasks/${context.rootState.route.params.taskId}/info`)).then(res => {
			context.commit('setTaskInfo', res.data.collectorTaskInfo)
			return res
		})
	},

	async getDetailFilesTotalSize(context) {
		const taskId = context.rootState.route.params.taskId
		return axios.get(generateUrl(`/apps/mediadc/api/v1/tasks/${taskId}/filestotal`)).then(res => {
			context.commit('setDetailsInfo', { filessize: res.data.filessize, filestotal: res.data.filestotal })
			return res
		})
	},

	async terminateTask(context, task) {
		return axios.post(generateUrl(`/apps/mediadc/api/v1/tasks/${task.id}/terminate`)).then(res => {
			context.dispatch('getTaskDetails')
			return res
		})
	},
}

export default { state, mutations, getters, actions }
