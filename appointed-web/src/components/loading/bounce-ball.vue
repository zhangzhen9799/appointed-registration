<script setup>
</script>

<template>
  <div class="loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style lang="less" scoped>
.loading,
.loading > div {
  position: relative;
  box-sizing: border-box;
}

.loading {
  display: block;
  font-size: 0;
  color: #fff;
  width: 0.54rem;
  height: 0.18rem;
}

.loading > div {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
  width: 0.1rem;
  height: 0.1rem;
  margin: 0.04rem;
  border-radius: 100%;
  animation: ball-pulse-sync 0.6s infinite linear;
}


.loading > div:nth-child(1) {
  animation-delay: -0.12s;
}

.loading > div:nth-child(2) {
  animation-delay: -0.06s;
}

.loading > div:nth-child(3) {
  animation-delay: 0s;
}


@keyframes ball-pulse-sync {
  33% {
    transform: translateY(100%);
  }

  66% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(0);
  }
}
</style>