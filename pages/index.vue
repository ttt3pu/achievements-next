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
          <img class="item__banner" :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${post.steamId}/header.jpg`" alt>
          <div>
            <h2 class="heading">
              <span class="title">{{ post.title }}</span>
            </h2>
            <div class="rating-container">
              <AtomRating
                :rating="post.rating"
                color="yellow"
              />
              <AtomRating
                :rating="post.yarikomiRating"
                color="blue"
              />
              <AtomRating
                :rating="post.subeomeDifficulty"
                color="red"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, useContext, useFetch } from '@nuxtjs/composition-api';
import CrownIcon from 'vue-material-design-icons/Crown.vue';
import AtomRating from '@/components/atoms/AtomRating.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    AtomRating,
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

<style lang="scss" scoped>
h1 {
  text-align: center;
  padding: 30px 0;
}

.item-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.item {
  $this: &;
  margin: 0 auto;
  width: 100%;
  display: flex;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  background-color: var(--bg-color-lv2);
  margin-bottom: 20px;

  .rank {
    font-size: 24px;
    position: relative;
    padding: 0 50px;
    display: flex;
    justify-content: center;
    align-items: center;

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
      color: var(--color-white);
      font-weight: 700;
      font-family: var(--font-family--en);
    }
  }

  &__inner {
    max-width: 100%;
    min-height: 75px;
    display: flex;
    align-items: center;
    transition: .2s;

    @media(max-width: 767px) {
      flex-wrap: wrap;
    }
  }

  &__banner {
    transition: .3s;

    @media(min-width: 768px) {
      height: 120px;
      margin-right: 30px;
    }

    @media(max-width: 767px) {
      width: 100%;
    }
  }

  .heading {
    position: relative;
    z-index: var(--z-layer);
  }

  .title {
  }
}

.rating-container {
  @media(min-width: 768px) {
    display: flex;

    > .atom-rating {
      margin-right: 30px;
    }
  }

  @media(max-width: 767px) {
  }
}
</style>
