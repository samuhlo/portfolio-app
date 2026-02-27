<script setup lang="ts">
import { showError } from '#app';

showError({
  statusCode: 404,
  statusMessage: 'Page Not Found',
});
</script>

<template>
  <div></div>
</template>
