<template>

</template>

<script lang="ts">
import Vue from 'vue';
import { faTimes, faBookmark, faKey, faSync, faMicrophoneSlash, faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake, faTrashAlt, faBookmark as farBookmark  } from '@fortawesome/free-regular-svg-icons';
import MkButton from '../../components/ui/button.vue';
import MkSwitch from '../../components/ui/switch.vue';
import Progress from '../../scripts/loading';

export default Vue.extend({
	components: {
		MkButton,
		MkSwitch,
	},

	data() {
		return {
			user: null,
			info: null,
			moderator: false,
			silenced: false,
			suspended: false,
			faTimes, faBookmark, farBookmark, faKey, faSync, faMicrophoneSlash, faSnowflake, faTrashAlt, faExternalLinkSquareAlt
		};
	},

	watch: {
		$route: 'fetch'
	},

	created() {
		this.fetch();
	},

	methods: {
		async fetch() {
			Progress.start();
			this.user = await this.$root.api('users/show', { userId: this.$route.params.user });
			this.info = await this.$root.api('admin/show-user', { userId: this.$route.params.user });
			this.moderator = this.info.isModerator;
			this.silenced = this.info.isSilenced;
			this.suspended = this.info.isSuspended;
			Progress.done();
		},

		/** 処理対象ユーザーの情報を更新する */
		async refreshUser() {
			this.user = await this.$root.api('users/show', { userId: this.user.id });
			this.info = await this.$root.api('admin/show-user', { userId: this.user.id });
		},

		openProfile() {
			window.open(Vue.filter('userPage')(this.user, null, true), '_blank');
		},

		async updateRemoteUser() {
			await this.$root.api('admin/update-remote-user', { userId: this.user.id }).then(res => {
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			});
			await this.refreshUser();
		},

		async resetPassword() {
			const dialog = this.$root.dialog({
				type: 'waiting',
				iconOnly: true
			});

			this.$root.api('admin/reset-password', {
				userId: this.user.id,
			}).then(({ password }) => {
				this.$root.dialog({
					type: 'success',
					text: this.$t('newPasswordIs', { password })
				});
			}).catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			}).finally(() => {
				dialog.close();
			});
		},

		async toggleSilence() {
			const confirm = await this.$root.dialog({
				type: 'warning',
				showCancelButton: true,
				text: this.silenced ? this.$t('silenceConfirm') : this.$t('unsilenceConfirm'),
			});
			if (confirm.canceled) {
				this.silenced = !this.silenced;
			} else {
				await this.$root.api(this.silenced ? 'admin/silence-user' : 'admin/unsilence-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleSuspend() {
			const confirm = await this.$root.dialog({
				type: 'warning',
				showCancelButton: true,
				text: this.suspended ? this.$t('suspendConfirm') : this.$t('unsuspendConfirm'),
			});
			if (confirm.canceled) {
				this.suspended = !this.suspended;
			} else {
				await this.$root.api(this.suspended ? 'admin/suspend-user' : 'admin/unsuspend-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleModerator() {
			await this.$root.api(this.moderator ? 'admin/moderators/add' : 'admin/moderators/remove', { userId: this.user.id });
			await this.refreshUser();
		},

		async deleteAllFiles() {
			const confirm = await this.$root.dialog({
				type: 'warning',
				showCancelButton: true,
				text: this.$t('deleteAllFilesConfirm'),
			});
			if (confirm.canceled) return;
			const process = async () => {
				await this.$root.api('admin/delete-all-files-of-a-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			};
			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});
			await this.refreshUser();
		},
	}
});
</script>

<style lang="scss" scoped>
.vrcsvlkm {
	display: flex;
	flex-direction: column;

	> ._card {
		> .actions {
			display: flex;
			box-sizing: border-box;
			text-align: left;
			align-items: center;
			margin-top: 16px;
			margin-bottom: 16px;
		}

		> .rawdata {
			> pre > code {
				display: block;
				width: 100%;
				height: 100%;
			}
		}
	}
}
</style>
