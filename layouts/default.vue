<template>
  <div class="wrapper">
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>

<style lang="scss">
@mixin z-map($z-map) {
  $before-index: -1;

  @each $name, $value in $z-map {
    $result-z: null;

    @if $value == auto {
      $result-z: $before-index + 1;
    }

    @else {
      $result-z: $value;
    }

    $before-index: $result-z;

    #{$name}: $result-z;
  }
}

html {
  // font settings
  --line-height: 1.875;
  --line-height--heading: 1.5;
  --font-family--en: 'Poppins', sans-serif;
  --font-family--jp: 'Noto Sans JP', sans-serif;
  --text-color: #eeeeee;
  --vh: 1vh;

  @include z-map((
    --z-init: auto,
    --z-cat: auto,
    --z-cat-layer: auto,
    --z-title: auto,
    --z-sns: auto,
    --z-scroll: auto,
    --z-language: auto,
  ));

  font-family: var(--font-family--jp);
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  line-height: var(--line-height);
  scroll-behavior: smooth;
  color: var(--text-color);
  background-color: #121212;
}

body {
  min-height: calc(100 * var(--vh));
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.wrapper{
  background-color: #121212;
}
</style>
