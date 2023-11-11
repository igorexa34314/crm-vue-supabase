<template>
	<v-form
		v-if="info && Object.keys(info).length"
		ref="form"
		@submit.prevent="submitHandler"
		class="profile-form mt-6 mt-sm-8 px-2 px-sm-4">
		<LocalizedInput
			v-model="formState.username"
			:rules="validations.username"
			variant="underlined"
			:label="t('user.username')"
			class="mb-5"
			required />

		<div class="d-flex flex-column items-center mb-4 flex-sm-row">
			<LocalizedInput
				v-model="formState.first_name"
				:rules="validations.firstName"
				variant="underlined"
				:label="t('user.firstName')"
				class="mr-sm-3" />

			<LocalizedInput
				v-model="formState.last_name"
				:rules="validations.lastName"
				variant="underlined"
				:label="t('user.lastName')"
				class="ml-sm-3" />
		</div>

		<div class="d-flex flex-column flex-md-row">
			<div class="flex-fill d-flex flex-column">
				<BirthdayPicker v-model="datePickerDate" :label="t('user.birthday')" class="flex-fill" />

				<v-radio-group v-model="formState.gender" :label="t('user.gender.label')" class="text-input">
					<v-radio
						v-for="gender in genderItems"
						:key="gender.value"
						:label="t(`user.gender.${gender.title}`)"
						:value="gender.value"
						color="radio" />
				</v-radio-group>
			</div>
			<div
				:style="{ 'max-width': smAndDown ? 'none' : '40%', width: '100%' }"
				class="d-flex flex-column pl-4 mt-md-0 my-4">
				<v-card variant="flat" :max-width="smAndDown ? 200 : 250" class="mb-5" elevation="4">
					<v-img
						:lazy-src="avatarPlaceholder"
						:src="info.avatar_url || avatarPlaceholder"
						alt="Ваш аватар"
						cover
						eager>
						<template #placeholder>
							<ImageLoader />
						</template>
					</v-img>
				</v-card>
				<div class="mb-3 text-subtitle">{{ t('upload_avatar') }}</div>
				<LocalizedFileInput
					v-model="formState.avatar"
					:label="t('user.avatar')"
					:rules="validations.file"
					variant="solo"
					:placeholder="t('upload_avatar')"
					accept="image/* "
					:density="xs ? 'compact' : 'comfortable'"
					style="max-width: 550px" />
			</div>
		</div>

		<LocalizedTextarea
			v-model="formState.bio"
			rows="1"
			auto-grow
			:label="t('user.bio')"
			:rules="validations.bio"
			class="mb-4" />

		<div class="d-flex flex-column items-center mt-4 flex-sm-row">
			<v-select
				v-model="formState.locale"
				:items="locales"
				:label="t('lang')"
				item-title="native_name"
				item-value="code"
				variant="underlined"
				class="mr-sm-4 text-input" />

			<v-select
				v-model="formState.currency"
				:items="currencies"
				:label="t('currency')"
				item-title="title"
				item-value="value"
				variant="underlined"
				class="ml-sm-4 text-input" />
		</div>

		<v-btn
			type="submit"
			color="success"
			:class="xs ? 'mt-3' : 'mt-5'"
			:loading="loading"
			:disabled="isInfoEqualsToStore && !formState.avatar.length">
			{{ t('update') }}
			<v-icon :icon="mdiSend" class="ml-3" />
		</v-btn>
	</v-form>

	<app-loader v-else page class="mt-5" />
</template>

<script setup lang="ts">
import LocalizedFileInput from '@/components/UI/LocalizedFileInput.vue';
import ImageLoader from '@/components/app/ImageLoader.vue';
import avatarPlaceholder from '@/assets/img/avatar-placeholder.jpg';
import BirthdayPicker from '@/components/UI/BirthdayPicker.vue';
import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import LocalizedTextarea from '@/components/UI/LocalizedTextarea.vue';
import { ref, computed, watchEffect } from 'vue';
import { mdiSend } from '@mdi/js';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
import { computedInject, useAsyncState } from '@vueuse/core';
import { LocaleService } from '@/services/locale';
import { user as validations } from '@/utils/validations';
import { VForm, VSelect, VRadio, VRadioGroup } from 'vuetify/components';
import { currencyKey } from '@/injection-keys';
import { useDisplay } from 'vuetify';
import { useSnackbarStore } from '@/stores/snackbar';
import { SERVER_CURRENCY, DEFAULT_LOCALE } from '@/global-vars';
import isEqual from 'lodash/isEqual';
import type { UserInfo } from '@/services/user';
import type { CurrencyRates } from '@/services/currency';

const { loading } = defineProps<{
	loading?: boolean;
}>();

const emit = defineEmits<{
	updateInfo: [info: Partial<Omit<UserInfo, 'updated_at'>> & { avatar: File[] }];
}>();

const { t } = useI18n();
const { xs, smAndDown } = useDisplay();
const userStore = useUserStore();

const currencies = computedInject(currencyKey, data => {
	const currencyNames = Object.keys(data?.currency.value?.rates || { [SERVER_CURRENCY]: 1 }) as CurrencyRates[];
	return currencyNames.map(c => ({ title: t(`currencies.${c}`) + ` (${c})`, value: c }));
});

const info = computed(() => userStore.info);

const form = ref<VForm | null>(null);

type NonUndefinedOrNullObjectFields<T extends { [key: string]: any }> = {
	[key in keyof T]: Exclude<T[key], null | undefined>;
};

type FormInfo = NonUndefinedOrNullObjectFields<UserInfo>;
const formState = ref<
	Partial<Omit<FormInfo, 'updated_at' | 'birthday_date'>> & { birthday_date: string | null; avatar: File[] }
>({
	username: '',
	first_name: '',
	last_name: '',
	bio: '',
	birthday_date: null,
	gender: 'unknown',
	locale: DEFAULT_LOCALE,
	currency: SERVER_CURRENCY,
	avatar: [],
});
const datePickerDate = computed({
	get: () => new Date(formState.value.birthday_date || new Date()),
	set: val => (formState.value.birthday_date = val.toDateString()),
});
const { state: locales } = useAsyncState(LocaleService.fetchAvailableLocales, [], {
	onError: () => {
		const { showMessage } = useSnackbarStore();
		showMessage(t('error_loading_locales'), 'red-darken-3');
	},
});

const genderItems = [
	{ title: 'male', value: 'male' },
	{ title: 'female', value: 'female' },
	{ title: 'unknown', value: 'unknown' },
];

//fillInfo
watchEffect(() => {
	if (info.value && Object.keys(info.value).length) {
		const { updated_at, bill, id, avatar_url, ...userdata } = info.value;
		formState.value = { ...formState.value, ...userdata };
	}
});

const isInfoEqualsToStore = computed(() => {
	const { avatar, ...formInfo } = formState.value;
	if (!info.value || !Object.keys(info.value).length) {
		return false;
	}
	const { updated_at, bill, id, avatar_url, ...userdata } = info.value;
	return isEqual(userdata, formInfo);
});

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid) {
		emit('updateInfo', formState.value);
		formState.value.avatar = [];
	}
};
</script>
