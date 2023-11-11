import { computed, toValue, type MaybeRef } from 'vue';
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	type ChartData,
	type ChartOptions,
	type ChartType,
	type TooltipItem,
} from 'chart.js';
import { useI18n } from 'vue-i18n';
import { useTheme, useDisplay } from 'vuetify';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useUserStore } from '@/stores/user';
import randomColor from 'randomcolor';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export const useChart = <T extends ChartType = 'pie'>(
	inputData: MaybeRef<
		| {
				label: string;
				data: ChartData<T>['datasets'][number]['data'][number];
		  }[]
		| undefined
	>
) => {
	const { t, n } = useI18n();
	const theme = useTheme();
	const { xs } = useDisplay();
	const { cf } = useCurrencyFilter();
	const userStore = useUserStore();

	const chartOptions = computed<ChartOptions<T>>(
		() =>
			({
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: t('chart_title'),
						color: theme.global.current.value.dark ? '#B8C7D3' : '#D50000',
						font: {
							size: xs.value ? 18 : 22,
							lineHeight: '1.5',
						},
					},
					legend: {
						display: !xs.value,
						position: 'left',
						align: 'center',
						labels: {
							boxHeight: 30,
							font: {
								weight: 'bold',
								size: 16,
							},
						},
					},
					tooltip: {
						enabled: true,
						callbacks: {
							label: (item: TooltipItem<'pie'>) =>
								n(cf.value(item.dataset.data[item.dataIndex]), {
									key: 'currency',
									currency: userStore.userCurrency,
								}),
						},
					},
				},
			}) as ChartOptions<T>
	);

	const chartData = computed<ChartData<T>>(
		() =>
			({
				labels: toValue(inputData)?.map(d => d.label) || [],
				datasets: [
					{
						data: toValue(inputData)?.map(d => d.data),
						backgroundColor: randomColor({
							count: toValue(inputData)?.length || 1,
							hue: theme.global.current.value.dark ? '#0E5578' : 'random',
							luminosity: theme.global.current.value.dark ? 'light' : 'bright',
						}),
						borderColor: theme.global.current.value.dark ? '#143c53' : '#8D6E63',
					},
				],
			}) as unknown as ChartData<T>
	);

	return { chartData, chartOptions };
};
