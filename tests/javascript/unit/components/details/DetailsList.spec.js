/**
 * @copyright Copyright (c) 2026
 *
 * @license AGPL-3.0-or-later
 */

import Vuex from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from '@nextcloud/axios'
import { emit } from '@nextcloud/event-bus'
import { showSuccess, showWarning } from '@nextcloud/dialogs'
import DetailsList from '../../../../../src/components/details/DetailsList.vue'

jest.mock('@nextcloud/axios', () => ({
	post: jest.fn(),
}))

jest.mock('@nextcloud/dialogs', () => ({
	showSuccess: jest.fn(),
	showWarning: jest.fn(),
	showError: jest.fn(),
}))

jest.mock('@nextcloud/event-bus', () => ({
	subscribe: jest.fn(),
	unsubscribe: jest.fn(),
	emit: jest.fn(),
}))

jest.mock('@nextcloud/router', () => ({
	generateUrl: (url) => url,
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const buildStore = () => new Vuex.Store({
	state: {},
	getters: {
		task: () => ({
			id: 42,
			type: 'manual',
			owner: 'admin',
			collector_settings: '{"duplicated":true}',
			files_scanned: 3,
			files_total: 3,
			files_total_size: 300,
			deleted_files_count: 0,
			deleted_files_size: 0,
			created_time: 1,
			finished_time: 2,
			py_pid: 0,
			errors: '',
		}),
		taskInfo: () => ({ target_directories: [], exclude_directories: [] }),
		details: () => [{ group_id: 10, files: [{ fileid: 1 }, { fileid: 2 }] }],
		detailsTotal: () => 1,
		detailsInfo: () => ({ filestotal: 2, filessize: 200 }),
		sorted: () => false,
		itemsPerPage: () => 5,
		detailsPage: () => 0,
		detailsFilterId: () => '10-20',
		autoOpenNextGroup: () => false,
	},
	mutations: {
		setSortGroups: jest.fn(),
		setDetailsPage: jest.fn(),
		setDetailsFilterId: jest.fn(),
		setTask: jest.fn(),
	},
	actions: {
		getTaskDetails: jest.fn(),
		getDetailFilesTotalSize: jest.fn(),
	},
})

describe('components/details/DetailsList.vue', () => {
	let store
	let wrapper

	beforeEach(() => {
		store = buildStore()
		jest.clearAllMocks()
		wrapper = shallowMount(DetailsList, {
			localVue,
			store,
			mocks: {
				t: (_app, msg) => msg,
				n: (_app, singular, plural, count) => (count === 1 ? singular : plural),
			},
			stubs: ['DetailsListItem', 'Pagination', 'NcCheckboxRadioSwitch', 'NcButton', 'NcActions', 'NcActionButton', 'NcLoadingIcon'],
		})
		wrapper.vm.fetchDetails = jest.fn().mockResolvedValue()
		jest.spyOn(store, 'dispatch').mockResolvedValue()
		jest.spyOn(store, 'commit')
	})

	it('passes the current group-id filter to exact delete', async () => {
		axios.post.mockResolvedValue({
			data: {
				eligibleGroupIds: [10],
				removedGroupIds: [10],
				partialGroupIds: [],
				task: { id: 42 },
			},
		})

		await wrapper.vm._deleteExactGroups()

		expect(axios.post).toHaveBeenCalledWith('/apps/mediadc/api/v1/tasks/42/details/delete-exact', {
			filterId: '10-20',
		})
		expect(wrapper.vm.fetchDetails).toHaveBeenCalled()
		expect(store.dispatch).toHaveBeenCalledWith('getDetailFilesTotalSize')
		expect(emit).toHaveBeenCalledWith('updateTaskInfo')
		expect(showSuccess).toHaveBeenCalledWith('Exact match groups successfully deleted')
	})

	it('shows a warning when no exact matches are eligible', async () => {
		axios.post.mockResolvedValue({
			data: {
				eligibleGroupIds: [],
				removedGroupIds: [],
				partialGroupIds: [],
				task: { id: 42 },
			},
		})

		await wrapper.vm._deleteExactGroups()

		expect(showWarning).toHaveBeenCalledWith('No exact hash and size matches found')
	})
})
