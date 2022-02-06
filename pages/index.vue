<template>
  <div>
    <h1>すべての実績を解除しました！おめでとう！</h1>

    <div class="item-container">
      <div v-for="(post, i) in posts" :key="i" class="item">
        <div class="rank">
          <!-- <CrownIcon /> -->
          <p>{{ i + 1 }}</p>
        </div>
        <div class="item__inner">
          <img :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${post.steamId}/header.jpg`" alt>
          <h2 class="heading">
            <span class="title">{{ post.title }}</span>
          </h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, useContext, useFetch } from '@nuxtjs/composition-api';
import CrownIcon from 'vue-material-design-icons/Crown.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    CrownIcon,
  },
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

.item-container {
  padding: 0 20px;
}

.item {
  $this: &;
  margin: 0 auto;
  width: 540px;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, .16);
  background-color: rgba(255, 255, 255, .05);
  margin-bottom: 10px;

  &:hover {
    #{$this}__inner {
      height: 215px;
    }
  }

  .rank {
    color: var(--color-yellow);
    font-size: 24px;
    position: relative;
    margin-right: 10px;
    padding-left: 10px;

    .crown-icon {
      display: block;
      width: 75px;
      height: 75px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    p {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: var(--z-layer);
      color: var(--color-white);
      font-weight: 700;
      font-family: var(--font-family--en);
    }
  }

  &__inner {
    max-width: 100%;
    width: 440px;
    height: 75px;
    overflow: hidden;
    display: flex;
    align-items: center;
    position: relative;
    transition: height .2s;
  }

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 50%;
  }

  .heading {
    position: relative;
    z-index: var(--z-layer);
    padding: 0 20px;
  }

  .title {
  }
}
</style>
