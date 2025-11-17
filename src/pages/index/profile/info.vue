<template>
	<div>
		<v-form
			v-if="info"
			ref="form"
			@submit.prevent="submitHandler"
			class="profile-form mt-6 mt-sm-8 px-2 px-sm-4">
			<LocalizedInput
				v-model="formState.username"
				:rules="validations.username"
				variant="underlined"
				:label="$t('user.username')"
				class="mb-5"
				required />

			<div class="d-flex flex-column items-center mb-4 flex-sm-row">
				<LocalizedInput
					v-model="formState.first_name"
					:rules="validations.firstName"
					variant="underlined"
					:label="$t('user.firstName')"
					class="mr-sm-3" />

				<LocalizedInput
					v-model="formState.last_name"
					:rules="validations.lastName"
					variant="underlined"
					:label="$t('user.lastName')"
					class="ml-sm-3" />
			</div>

			<div class="d-flex flex-column flex-md-row">
				<div class="flex-fill d-flex flex-column">
					<v-birthday-picker
						v-model="datePickerDate"
						:label="$t('user.birthday')"
						class="flex-fill"
						:month-formatter="month => $d(month, { month: 'long' })" />

					<v-radio-group
						v-model="formState.gender"
						:label="$t('user.gender.label')"
						class="text-input">
						<v-radio
							v-for="gender in genderItems"
							:key="gender.value"
							:label="$t(`user.gender.${gender.title}`)"
							:value="gender.value"
							color="radio" />
					</v-radio-group>
				</div>
				<div
					:style="{ 'max-width': $vuetify.display.smAndDown ? 'none' : '40%', width: '100%' }"
					class="d-flex flex-column pl-4 mt-md-0 my-4">
					<v-card
						variant="flat"
						:max-width="$vuetify.display.smAndDown ? 200 : 250"
						class="mb-5"
						elevation="4">
						<v-img
							:src="info.avatar_url || '/img/avatar-placeholder.jpg'"
							alt="Ваш аватар"
							cover
							eager>
							<template #placeholder>
								<ImageLoader />
							</template>
						</v-img>
					</v-card>
					<div class="mb-3 text-subtitle">{{ $t('upload_avatar') }}</div>
					<LocalizedFileInput
						v-model="formState.avatar"
						:label="$t('user.avatar')"
						:rules="validations.file"
						variant="solo"
						:placeholder="$t('upload_avatar')"
						accept="image/* "
						:density="$vuetify.display.xs ? 'compact' : 'comfortable'"
						style="max-width: 550px" />
				</div>
			</div>

			<LocalizedTextarea
				v-model="formState.bio"
				rows="1"
				auto-grow
				:label="$t('user.bio')"
				:rules="validations.bio"
				class="mb-4" />

			<div class="d-flex flex-column items-center mt-4 flex-sm-row">
				<v-select
					v-model="formState.locale"
					:items="localesState.data"
					:label="$t('lang')"
					item-title="native_name"
					item-value="code"
					variant="underlined"
					class="mr-sm-4 text-input" />

				<v-select
					v-model="formState.currency"
					:items="currencies"
					:label="$t('currency')"
					item-title="title"
					item-value="value"
					variant="underlined"
					class="ml-sm-4 text-input" />
			</div>

			<v-btn
				type="submit"
				color="success"
				:class="$vuetify.display.xs ? 'mt-3' : 'mt-5'"
				:loading="loading"
				:disabled="isInfoEqualsToStore && !formState.avatar">
				{{ $t('update') }}
				<v-icon :icon="mdiSend" class="ml-3" />
			</v-btn>
		</v-form>

		<app-loader v-else page class="mt-5" />
	</div>
</template>

<script setup lang="ts">
import LocalizedFileInput from '@/components/ui/LocalizedFileInput.vue';
import ImageLoader from '@/components/app/ImageLoader.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import LocalizedTextarea from '@/components/ui/LocalizedTextarea.vue';
import { VBirthdayPicker } from 'vuetify-birthdaypicker';
import { ref, computed, watchEffect, useTemplateRef, watch } from 'vue';
import { mdiSend } from '@mdi/js';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
import { fetchAvailableLocales } from '@/api/locale';
import { user as validations } from '@/utils/validations';
import { useSnackbarStore } from '@/stores/snackbar';
import { defaultLocale } from '@/constants/i18n';
import { serverCurrency } from '@/constants/currency';
import deepEqual from 'deep-equal';
import { updateInfo, updateAvatar, type UserInfo } from '@/api/user';
import type { CurrencyRates } from '@/api/currency';
import { useCurrencyQueryState } from '@/queries/currency';
import { useQuery } from '@pinia/colada';

const { showMessage } = useSnackbarStore();
const { t, te } = useI18n();
const userStore = useUserStore();

const { data: currency } = useCurrencyQueryState();

const currencies = computed(() => {
	const currencyNames = Object.keys(
		currency.value?.rates || { [serverCurrency]: 1 }
	) as CurrencyRates[];
	return currencyNames.map(c => ({ title: t(`currencies.${c}`) + ` (${c})`, value: c }));
});

const info = computed(() => userStore.info);

const formRef = useTemplateRef('form');

type NonUndefinedOrNullObjectFields<T extends { [key: string]: unknown }> = {
	[key in keyof T]: Exclude<T[key], null | undefined>;
};

type FormInfo = NonUndefinedOrNullObjectFields<UserInfo>;
const formState = ref<
	Partial<Omit<FormInfo, 'updated_at' | 'birthday_date'>> & {
		birthday_date: string | null;
		avatar: File | null;
	}
>({
	username: '',
	first_name: '',
	last_name: '',
	bio: '',
	birthday_date: null,
	gender: 'unknown',
	locale: defaultLocale,
	currency: serverCurrency,
	avatar: null,
});
const datePickerDate = computed({
	get: () => new Date(formState.value.birthday_date || new Date()),
	set: val => (formState.value.birthday_date = val.toDateString()),
});

const { state: localesState, error: localesError } = useQuery({
	key: ['locales'],
	query: fetchAvailableLocales,
});

watch(localesError, e => {
	if (e) {
		showMessage(t('error_loading_locales'), 'red-darken-3');
	}
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
	return deepEqual(userdata, formInfo, { strict: true });
});

const loading = ref(false);

const submitHandler = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid) {
		try {
			const { avatar, ...userdata } = formState.value;
			loading.value = true;
			await updateInfo(userdata);
			if (avatar) {
				await updateAvatar(avatar);
			}
			showMessage(t('updateProfile_message'));
		} catch (e) {
			showMessage(
				te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_update_profile'),
				'red-darken-3'
			);
		} finally {
			loading.value = false;
		}
		formState.value.avatar = null;
	}
};
</script>
