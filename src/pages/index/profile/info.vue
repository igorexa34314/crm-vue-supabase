<template>
	<div>
		<v-form
			v-if="info"
			ref="form"
			@submit.prevent="submitHandler"
			class="profile-form mt-6 px-2 sm:mt-8 sm:px-4">
			<LocalizedInput
				v-model="formState.username"
				:rules="validations.username"
				variant="underlined"
				:label="$t('user.username')"
				class="mb-5"
				required />

			<div class="mb-4 flex flex-col items-center sm:flex-row">
				<LocalizedInput
					v-model="formState.first_name"
					:rules="validations.firstName"
					variant="underlined"
					:label="$t('user.firstName')"
					class="sm:mr-3" />

				<LocalizedInput
					v-model="formState.last_name"
					:rules="validations.lastName"
					variant="underlined"
					:label="$t('user.lastName')"
					class="sm:ml-3" />
			</div>

			<div class="flex flex-col md:flex-row">
				<div class="flex grow flex-col">
					<v-birthday-picker
						v-model="datePickerDate"
						:label="$t('user.birthday')"
						class="grow"
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
					:style="{ 'max-width': smAndDown ? 'none' : '40%', width: '100%' }"
					class="my-4 pl-4 flex flex-col md:mt-0">
					<v-card
						variant="flat"
						:width="smAndDown ? 200 : 250"
						:height="smAndDown ? 200 : 250"
						class="mb-5"
						elevation="1">
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
					<div class="text-subtitle mb-3">{{ $t('upload_avatar') }}</div>
					<LocalizedFileInput
						v-model="formState.avatar"
						:label="$t('user.avatar')"
						:rules="validations.file"
						variant="solo"
						:placeholder="$t('upload_avatar')"
						accept="image/* "
						:density="xs ? 'compact' : 'comfortable'"
						class="max-w-[550px]" />
				</div>
			</div>

			<LocalizedTextarea
				v-model="formState.bio"
				rows="1"
				auto-grow
				:label="$t('user.bio')"
				:rules="validations.bio"
				class="mb-4" />

			<div class="mt-4 flex flex-col items-center sm:flex-row">
				<v-select
					v-model="formState.locale"
					:items="localesState.data"
					:label="$t('lang')"
					item-title="native_name"
					item-value="code"
					variant="underlined"
					class="text-input sm:mr-4" />

				<v-select
					v-model="formState.currency"
					:items="currencies"
					:label="$t('currency')"
					item-title="title"
					item-value="value"
					variant="underlined"
					class="text-input sm:ml-4" />
			</div>

			<v-btn
				type="submit"
				color="success"
				:class="xs ? 'mt-3' : 'mt-5'"
				:loading="updateInfoAsyncStatus === 'loading'"
				:disabled="isInfoEqualsToStore && !formState.avatar">
				{{ $t('update') }}
				<v-icon icon="i-mdi-send" class="ml-3" />
			</v-btn>
		</v-form>

		<app-loader v-else page />
	</div>
</template>

<script setup lang="ts">
import LocalizedFileInput from '@/components/ui/LocalizedFileInput.vue';
import ImageLoader from '@/components/app/ImageLoader.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import LocalizedTextarea from '@/components/ui/LocalizedTextarea.vue';
import { VBirthdayPicker } from 'vuetify-birthdaypicker';
import { ref, computed, watchEffect, useTemplateRef, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
import { fetchAvailableLocales } from '@/api/locale';
import { user as validations } from '@/utils/validations';
import { useSnackbarStore } from '@/stores/snackbar';
import { defaultLocale } from '@/constants/i18n';
import { serverCurrency } from '@/constants/currency';
import deepEqual from 'deep-equal';
import { type UserInfo } from '@/api/user';
import type { CurrencyRates } from '@/api/currency';
import { useCurrencyQueryState } from '@/queries/currency';
import { useQuery } from '@pinia/colada';
import { useUpdateUserInfo } from '@/mutations/user';
import { Constants } from '@/types/database-types';
import { useDisplay } from 'vuetify';

const { showErrorMessage } = useSnackbarStore();
const { t } = useI18n();
const { xs, smAndDown } = useDisplay();
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
		showErrorMessage(t('error_loading_locales'));
	}
});

const genderItems = Constants.public.Enums.user_gender.map(g => ({
	title: `${g}`,
	value: g,
}));

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

const { mutateAsync: updateInfo, asyncStatus: updateInfoAsyncStatus } = useUpdateUserInfo();

const submitHandler = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid) {
		await updateInfo(formState.value);
		formState.value.avatar = null;
	}
};
</script>
