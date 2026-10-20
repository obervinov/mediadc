<template>
	<NcModal :name="title" size="normal" @close="cancel">
		<div class="directory-picker">
			<h2>{{ title }}</h2>
			<div class="directory-picker__breadcrumbs">
				<button v-for="crumb in breadcrumbs"
					:key="crumb.path"
					class="directory-picker__crumb"
					type="button"
					@click="open(crumb.path)">
					{{ crumb.name }}
				</button>
			</div>
			<div class="directory-picker__list">
				<NcLoadingIcon v-if="loading" :size="32" />
				<span v-else-if="error">{{ t('mediadc', 'Could not load directories') }}</span>
				<span v-else-if="folders.length === 0">{{ t('mediadc', 'No subdirectories') }}</span>
				<ul v-else>
					<li v-for="folder in folders" :key="folder.fileid">
						<button type="button" class="directory-picker__folder" @click="open(folder.path)">
							<Folder :size="20" />
							<span>{{ folder.name }}</span>
						</button>
					</li>
				</ul>
			</div>
			<div class="directory-picker__actions">
				<NcButton @click="cancel">
					{{ t('mediadc', 'Cancel') }}
				</NcButton>
				<NcButton type="primary" :disabled="loading || error" @click="choose">
					{{ t('mediadc', 'Choose {name}', { name: currentName }) }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import axios, { isCancel } from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import { NcButton, NcLoadingIcon, NcModal } from '@nextcloud/vue'
import Folder from 'vue-material-design-icons/Folder.vue'

export default {
	name: 'DirectoryPicker',
	components: {
		NcButton,
		NcLoadingIcon,
		NcModal,
		Folder,
	},
	props: {
		title: {
			type: String,
			required: true,
		},
	},
	emits: ['choose', 'cancel'],
	data() {
		return {
			path: '/',
			folders: [],
			loading: false,
			error: false,
			request: null,
		}
	},
	computed: {
		breadcrumbs() {
			const crumbs = [{ name: this.t('mediadc', 'Home'), path: '/' }]
			let path = ''
			this.path.split('/').filter(part => part !== '').forEach(part => {
				path += `/${part}`
				crumbs.push({ name: part, path })
			})
			return crumbs
		},
		currentName() {
			return this.breadcrumbs[this.breadcrumbs.length - 1].name
		},
	},
	mounted() {
		this.open('/')
	},
	beforeDestroy() {
		if (this.request !== null) {
			this.request.abort()
		}
	},
	methods: {
		open(path) {
			if (this.request !== null) {
				this.request.abort()
			}
			this.request = new AbortController()
			this.loading = true
			this.error = false
			axios.get(generateUrl('/apps/mediadc/api/v1/folders'), {
				params: { path },
				signal: this.request.signal,
			}).then(res => {
				this.path = res.data.path
				this.folders = res.data.folders
				this.loading = false
			}).catch(err => {
				if (isCancel(err)) {
					return
				}
				console.debug(err)
				this.error = true
				this.loading = false
			})
		},
		choose() {
			this.$emit('choose', this.path)
		},
		cancel() {
			this.$emit('cancel')
		},
	},
}
</script>

<style scoped>
.directory-picker {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 20px;
	height: 60vh;
}

.directory-picker__breadcrumbs {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.directory-picker__crumb {
	margin: 0;
	padding: 2px 8px;
}

.directory-picker__crumb:not(:last-child)::after {
	content: ' /';
}

.directory-picker__list {
	flex: 1;
	overflow-y: auto;
}

.directory-picker__folder {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	margin: 0;
	border: none;
	border-radius: var(--border-radius);
	background: transparent;
	text-align: start;
}

.directory-picker__folder:hover {
	background: var(--color-background-hover);
}

.directory-picker__actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>
