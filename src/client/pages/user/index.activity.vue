<template>

</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		user: {
			type: Object,
			required: true
		},
		limit: {
			type: Number,
			required: false,
			default: 40
		}
	},
	data() {
		return {
			fetching: true,
			data: [],
			peak: null
		};
	},
	mounted() {
		
	}
});
</script>
