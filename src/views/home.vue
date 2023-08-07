<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

useMeta({ title: 'pageTitles.home' });

const { push } = useRouter();

push('/');
</script>