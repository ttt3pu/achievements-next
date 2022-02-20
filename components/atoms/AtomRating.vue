<template>
  <div class="atom-rating" :data-color="color">
    <Star v-for="i in rating" :key="i" class="rating" />
    <StarOutLine v-for="i in 5 - rating" :key="i" class="bg" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import Star from 'vue-material-design-icons/Star.vue';
import StarOutLine from 'vue-material-design-icons/StarOutLine.vue';

export default defineComponent({
  name: 'AtomRating',
  components: {
    StarOutLine,
    Star,
  },
  props: {
    rating: {
      type: Number,
      required: true,
    },
    color: {
      type: String as PropType<'blue' | 'red' | 'yellow'>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.atom-rating {
  color: var(--color-white);
  display: flex;

  &:not(:last-child) {
    margin-bottom: 10px;
  }

  &[data-color="yellow"] .rating {
    color: var(--color-yellow);
  }
  &[data-color="blue"] .rating {
    color: var(--color-blue);
  }
  &[data-color="red"] .rating {
    color: var(--color-red);
  }
}

.rating,
.bg {
  display: block;
  width: 20px;
  height: 20px;
}
</style>
