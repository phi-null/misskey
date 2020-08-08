<template>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPlus, faUsers, faSearch, faBookmark, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake, faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import parseAcct from '../../../misc/acct/parse';
import MkButton from '../../components/ui/button.vue';
import MkInput from '../../components/ui/input.vue';
import MkSelect from '../../components/ui/select.vue';
import MkPagination from '../../components/ui/pagination.vue';
import MkUserSelect from '../../components/user-select.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: `${this.$t('users')} | ${this.$t('instance')}`
		};
	},

	components: {
		MkButton,
		MkInput,
		MkSelect,
		MkPagination,
	},

	data() {
		return {
			target: '',
			sort: '+createdAt',
			state: 'all',
			origin: 'local',
			searchUsername: '',
			searchHost: '',
			pagination: {
				endpoint: 'admin/show-users',
				limit: 10,
				params: () => ({
					sort: this.sort,
					state: this.state,
					origin: this.origin,
					username: this.searchUsername,
					hostname: this.searchHost,
				}),
				offsetMode: true
			},
			faPlus, faUsers, faSearch, faBookmark, farBookmark, faMicrophoneSlash, faSnowflake
		}
	},

	watch: {
		sort() {
			this.$refs.users.reload();
		},
		state() {
			this.$refs.users.reload();
		},
		origin() {
			this.$refs.users.reload();
		},
	},

	methods: {
		/** テキストエリアのユーザーを解決する */
		fetchUser() {
			return new Promise((res) => {
				const usernamePromise = this.$root.api('users/show', parseAcct(this.target));
				const idPromise = this.$root.api('users/show', { userId: this.target });
				let _notFound = false;
				const notFound = () => {
					if (_notFound) {
						this.$root.dialog({
							type: 'error',
							text: this.$t('noSuchUser')
						});
					} else {
						_notFound = true;
					}
				};
				usernamePromise.then(res).catch(e => {
					if (e.code === 'NO_SUCH_USER') {
						notFound();
					}
				});
				idPromise.then(res).catch(e => {
					notFound();
				});
			});
		},

		/** テキストエリアから処理対象ユーザーを設定する */
		async showUser() {
			const user = await this.fetchUser();
			this.show(user);
			this.target = '';
		},

		searchUser() {
			this.$root.new(MkUserSelect, {}).$once('selected', user => {
				this.show(user);
			});
		},

		async addUser() {
			const { canceled: canceled1, result: username } = await this.$root.dialog({
				title: this.$t('username'),
				input: true
			});
			if (canceled1) return;

			const { canceled: canceled2, result: password } = await this.$root.dialog({
				title: this.$t('password'),
				input: { type: 'password' }
			});
			if (canceled2) return;

			const dialog = this.$root.dialog({
				type: 'waiting',
				iconOnly: true
			});

			this.$root.api('admin/accounts/create', {
				username: username,
				password: password,
			}).then(res => {
				this.$refs.users.reload();
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			}).catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.id
				});
			}).finally(() => {
				dialog.close();
			});
		},

		async show(user) {
			this.$router.push('./users/' + user.id);
		}
	}
});
</script>

<style lang="scss" scoped>
.mk-instance-users {
	> .users {
		> ._content {
			max-height: 300px;
			overflow: auto;
			
			> .users {
				> .user {
					display: flex;
					width: 100%;
					box-sizing: border-box;
					text-align: left;
					align-items: center;

					> .avatar {
						width: 64px;
						height: 64px;
					}

					> .body {
						margin-left: 0.3em;
						padding: 8px;
						flex: 1;

						@media (max-width 500px) {
							font-size: 14px;
						}

						> header {
							> .name {
								font-weight: bold;
							}

							> .acct {
								margin-left: 8px;
								opacity: 0.7;
							}

							> .staff {
								margin-left: 0.5em;
								color: var(--badge);
							}

							> .punished {
								margin-left: 0.5em;
								color: #4dabf7;
							}
						}
					}
				}
			}
		}
	}
}
</style>
