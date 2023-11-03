<script>
	export default {
		onLaunch: function () {},
		onShow: function () {},
		onHide: function () {},
		methods: {},
	};
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import 'uview-plus/index.scss';
	* {
		box-sizing: border-box;
	}
	page {
		font-size: 28rpx;
		background: #f6f6f6;
		color: #333;
		font-family: Source Han Sans SC;
	}
	uni-modal {
		z-index: 999999 !important;
	}
</style>
