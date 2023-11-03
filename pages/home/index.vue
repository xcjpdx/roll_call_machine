<template>
	<div class="page_box">
		<div class="title">点名器</div>
		<div class="show">{{ selectName || '点击 开始按钮 进行点名' }}</div>
		<div class="bottom">
			<u-button type="success" text="开始" @click="startCall"></u-button>
			<u-button text="设置" @click="safeShow = true"></u-button>
		</div>
	</div>
	<u-popup
		:show="safeShow"
		@close="safeShow = false"
		:round="20"
		mode="center"
		:customStyle="{
			padding: '30rpx',
			width: '80%',
		}"
	>
		<div class="safe-box">
			<div class="safe-box-title">输入密码打开设置</div>
			<up-input placeholder="请输入密码" border="surround" clearable v-model="safeValue"></up-input>
			<div class="safe-box-btn">
				<u-button type="success" text="确定" @click="openSet"></u-button>
				<u-button text="取消" @click="safeShow = false"></u-button>
			</div>
		</div>
	</u-popup>
	<u-popup
		:show="setShow"
		@close="setShow = false"
		:round="20"
		:customStyle="{
			padding: '30rpx',
		}"
	>
		<view class="set-box">
			<div class="set-box-title">设置名单内容</div>
			<div class="set-box-add">
				<up-input
					placeholder="请输入名字"
					clearable
					border="surround"
					v-model="setAddName"
				></up-input>
				<up-input
					placeholder="请输入概率"
					clearable
					border="surround"
					type="number"
					v-model="setAddProbability"
				></up-input>
				<u-button type="success" text="添加" @click="addData"></u-button>
			</div>
			<div class="set-box-list">
				<view v-for="(item, index) in list" :key="index" class="set-box-list-item">
					<div class="set-box-list-item-left">
						<view class="set-box-list-item-name">{{ item.name }}</view>
						<view class="set-box-list-item-probability">{{ item.probability }} %</view>
					</div>
					<div class="set-box-list-item-right">
						<div class="set-box-list-item-set" @click="openEdit(item)">编辑</div>
						<div class="set-box-list-item-delete" @click="deleteData(index)">删除</div>
					</div>
				</view>
			</div>
		</view>
	</u-popup>
	<u-popup
		:show="editShow"
		@close="editShow = false"
		:round="20"
		mode="center"
		:customStyle="{
			padding: '30rpx',
			width: '80%',
		}"
	>
		<div class="edit-box">
			<div class="edit-box-content">
				<div class="edit-box-content-item">
					<view>名字：</view>
					<up-input
						placeholder="请输入名字"
						clearable
						border="surround"
						v-model="editData.name"
					></up-input>
				</div>
				<div class="edit-box-content-item">
					<view>概率：</view>
					<up-input
						placeholder="请输入概率"
						border="surround"
						clearable
						type="number"
						v-model="editData.probability"
					></up-input>
				</div>
			</div>
			<div class="edit-box-btn">
				<u-button type="success" text="确定" @click="editDetermine"></u-button>
				<u-button text="取消" @click="editCancellation"></u-button>
			</div>
		</div>
	</u-popup>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app';

	onMounted(() => {
		list.value = uni.getStorageSync('list');
		if (!list.value) {
			list.value = [
				{
					name: '张三',
					probability: 10, // 概率(百分百)
				},
				{
					name: '李四',
					probability: 90, // 概率(百分百)
				},
			];
		}
	});

	let safeShow = ref(false); // 是否显示输入密码弹窗
	let safe = ref('123456'); // 密码
	let safeValue = ref(''); // 输入的密码

	let list = ref([]);
	let selectName = ref(''); // 选中的名字
	let throttle = ref(false); // 节流
	// 开始点名
	function startCall() {
		if (list.value.length == 0) {
			uni.showToast({
				title: '名单中没有一个人,请先添加',
				icon: 'none',
			});
			return;
		}
		if (throttle.value) return;
		throttle.value = true;
		uni.showLoading({
			title: '点名中',
		});
		// 生成一个1-100的随机数
		let random = Math.floor(Math.random() * 100) + 1;
		// console.log('概率', random);
		// 总次数
		let count = 0;
		let name = '';
		while (1) {
			count++;
			if (count > 50) {
				name = '这次没有人被选中';
				break;
			}
			// 生成一个0-list数组长度的随机数
			let index = Math.floor(Math.random() * list.value.length);
			// console.log('选中的下标', index);
			if (list.value[index].probability >= random) {
				name = list.value[index].name;
				break;
			}
		}
		setTimeout(() => {
			throttle.value = false;
			selectName.value = name;
			uni.hideLoading();
		}, 1000);
	}

	let setShow = ref(false); // 是否显示设置弹窗
	let setAddName = ref(''); // 设置弹窗 添加的名字
	let setAddProbability = ref(''); // 设置弹窗 添加的概率
	// 打开设置弹窗
	function openSet() {
		if (safe.value != safeValue.value) {
			uni.showToast({
				title: '密码错误',
				icon: 'none',
			});
			return;
		}
		setAddName.value = '';
		safeValue.value = '';
		setShow.value = true;
		safeShow.value = false;
	}
	// 添加数据
	function addData() {
		if (!setAddName.value) {
			uni.showToast({
				title: '请输入名字',
				icon: 'none',
			});
			return;
		}
		if (!setAddProbability.value) {
			uni.showToast({
				title: '请输入概率',
				icon: 'none',
			});
			return;
		}
		if (setAddProbability.value > 99) {
			uni.showToast({
				title: '概率不能大于99',
				icon: 'none',
			});
			return;
		}
		if (setAddProbability.value < 1) {
			uni.showToast({
				title: '概率不能小于1',
				icon: 'none',
			});
			return;
		}
		let obj = {
			name: setAddName.value,
			probability: setAddProbability.value,
		};
		list.value.push(obj);
		uni.showToast({
			title: '添加成功',
			icon: 'none',
		});
		setAddName.value = '';
		setAddProbability.value = '';
		uni.setStorageSync('list', list.value);
	}
	// 打开编辑弹窗
	function openEdit(item) {
		editData.value = item;
		editCopyData.value = JSON.parse(JSON.stringify(item));
		editShow.value = true;
	}
	// 删除数据
	function deleteData(index) {
		uni.showModal({
			title: '提示',
			content: '确定要删除吗？',
			success: (res) => {
				if (res.confirm) {
					list.value.splice(index, 1);
					uni.showToast({
						title: '删除成功',
						icon: 'none',
					});
					uni.setStorageSync('list', list.value);
				}
			},
		});
	}

	let editData = ref({}); // 选中编辑的数据
	let editCopyData = ref({}); // 选中编辑的备份数据
	let editShow = ref(false); // 是否显示编辑弹窗
	// 编辑确定
	function editDetermine() {
		if (!editData.value.name) {
			uni.showToast({
				title: '请输入名字',
				icon: 'none',
			});
			return;
		}
		if (!editData.value.probability) {
			uni.showToast({
				title: '请输入概率',
				icon: 'none',
			});
			return;
		}
		if (editData.value.probability > 99) {
			uni.showToast({
				title: '概率不能大于99',
				icon: 'none',
			});
			return;
		}
		if (editData.value.probability < 1) {
			uni.showToast({
				title: '概率不能小于1',
				icon: 'none',
			});
			return;
		}
		editShow.value = false;
		uni.showToast({
			title: '编辑成功',
			icon: 'none',
		});
		uni.setStorageSync('list', list.value);
	}
	// 编辑取消
	function editCancellation() {
		editData.value = editCopyData.value;
		editShow.value = false;
	}
</script>

<style lang="scss">
	.page_box {
		padding: 50rpx 20rpx;
		animation: movement 10s linear infinite;
		background-image: radial-gradient(closest-side, rgba(235, 105, 78, 0.8), rgba(235, 105, 78, 0)),
			radial-gradient(closest-side, rgba(243, 11, 164, 0.8), rgba(243, 11, 164, 0)),
			radial-gradient(closest-side, hsla(50, 98%, 75%, 0.8), hsla(50, 98%, 75%, 0)),
			radial-gradient(closest-side, rgba(170, 142, 245, 0.8), rgba(170, 142, 245, 0)),
			radial-gradient(closest-side, hsla(27, 88%, 77%, 0.8), hsla(27, 88%, 77%, 0));
		background-position: -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax, -30vmax -10vmax,
			50vmax 50vmax;
		background-repeat: no-repeat;
		background-size: 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax, 110vmax 110vmax, 90vmax 90vmax;
	}
	@-webkit-keyframes movement {
		0%,
		100% {
			background-position: -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax, -30vmax -10vmax,
				50vmax 50vmax;
			background-size: 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax, 110vmax 110vmax, 90vmax 90vmax;
		}

		25% {
			background-position: -60vmax -90vmax, 50vmax -40vmax, 0 -20vmax, -40vmax -20vmax,
				40vmax 60vmax;
			background-size: 100vmax 100vmax, 90vmax 90vmax, 100vmax 100vmax, 90vmax 90vmax, 60vmax 60vmax;
		}

		50% {
			background-position: -50vmax -70vmax, 40vmax -30vmax, 10vmax 0, 20vmax 10vmax, 30vmax 70vmax;
			background-size: 80vmax 80vmax, 110vmax 110vmax, 80vmax 80vmax, 60vmax 60vmax, 80vmax 80vmax;
		}

		75% {
			background-position: -50vmax -40vmax, 50vmax -30vmax, 20vmax 0, -10vmax 10vmax, 40vmax 60vmax;
			background-size: 90vmax 90vmax, 90vmax 90vmax, 100vmax 100vmax, 90vmax 90vmax, 70vmax 70vmax;
		}
	}
	@keyframes movement {
		0%,
		100% {
			background-position: -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax, -30vmax -10vmax,
				50vmax 50vmax;
			background-size: 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax, 110vmax 110vmax, 90vmax 90vmax;
		}

		25% {
			background-position: -60vmax -90vmax, 50vmax -40vmax, 0 -20vmax, -40vmax -20vmax,
				40vmax 60vmax;
			background-size: 100vmax 100vmax, 90vmax 90vmax, 100vmax 100vmax, 90vmax 90vmax, 60vmax 60vmax;
		}

		50% {
			background-position: -50vmax -70vmax, 40vmax -30vmax, 10vmax 0, 20vmax 10vmax, 30vmax 70vmax;
			background-size: 80vmax 80vmax, 110vmax 110vmax, 80vmax 80vmax, 60vmax 60vmax, 80vmax 80vmax;
		}

		75% {
			background-position: -50vmax -40vmax, 50vmax -30vmax, 20vmax 0, -10vmax 10vmax, 40vmax 60vmax;
			background-size: 90vmax 90vmax, 90vmax 90vmax, 100vmax 100vmax, 90vmax 90vmax, 70vmax 70vmax;
		}
	}
	.title {
		display: flex;
		justify-content: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #000;
		margin-bottom: 50rpx;
	}
	.show {
		margin-bottom: 50rpx;
		background: rgba(0, 0, 0, 0.2);
		padding: 100rpx 0;
		display: flex;
		justify-content: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
	}
	.bottom {
		display: flex;
		justify-content: center;
		align-items: center;
		::v-deep {
			.u-button {
				width: 40%;
			}
		}
	}
	.safe-box {
		.safe-box-title {
			margin-bottom: 30rpx;
			display: flex;
			justify-content: center;
			font-size: 26rpx;
		}
		.safe-box-btn {
			margin-top: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			::v-deep {
				.u-button {
					width: 45%;
					margin: 0;
				}
			}
		}
	}
	.set-box {
		.set-box-title {
			margin-bottom: 30rpx;
			display: flex;
			justify-content: center;
			font-size: 26rpx;
		}
		.set-box-add {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			::v-deep {
				.u-input {
					width: 60%;
					margin-right: 10rpx;
				}
				.u-button {
					width: 25%;
				}
			}
		}
		.set-box-list {
			max-height: 30vh;
			overflow-y: auto;
			.set-box-list-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10rpx;
				.set-box-list-item-left {
					width: 60%;
					display: flex;
					align-items: center;
					.set-box-list-item-name {
						width: 60%;
						font-size: 26rpx;
						margin-right: 20rpx;
					}
					.set-box-list-item-probability {
						font-size: 26rpx;
					}
				}
				.set-box-list-item-right {
					flex: 1;
					display: flex;
					justify-content: flex-end;
					align-items: center;
					.set-box-list-item-set {
						margin: 0 30rpx;
						padding: 10rpx 15rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						background: #1994e1;
						color: #fff;
						font-size: 26rpx;
						border-radius: 10rpx;
					}
					.set-box-list-item-delete {
						background: #ff0000;
						padding: 10rpx 15rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						color: #fff;
						font-size: 26rpx;
						border-radius: 10rpx;
					}
				}
			}
		}
	}
	.edit-box {
		::v-deep {
			.u-input {
				width: 60%;
				margin-right: 10rpx;
			}
			.u-button {
				width: 25%;
			}
		}
		.edit-box-content {
			margin-bottom: 30rpx;
			.edit-box-content-item {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 15rpx;
			}
		}
		.edit-box-btn {
			display: flex;
			align-items: center;
		}
	}
</style>
