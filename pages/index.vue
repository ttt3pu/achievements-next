<template>
  <div>
    <h1>すべての実績を解除しました！おめでとう！</h1>

    <div v-for="(post, i) in posts" :key="i">
      <span>{{ i + 1 }}</span>
      <h2>{{ post.title }}</h2>
    </div>
  </div>
</template>

<script>
import { defineComponent, useContext, useFetch } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const { store } = useContext();

    const { posts } = store.state;

    useFetch(async () => {
    });

    return {
      posts,
    };
  },
});
</script>

<style lang="scss">
h1 {
  text-align: center;
}
</style>
