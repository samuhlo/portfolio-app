<script setup lang="ts">
/**
 * █ [FEATURE] :: CONSOLE MESSAGE
 * =====================================================================
 * DESC:   Inyecta Easter Egg (ASCII Art + Info) en la terminal de Chrome.
 * STATUS: STABLE
 * =====================================================================
 */
import { onMounted } from 'vue';
import figlet from 'figlet';
import standard from 'figlet/importable-fonts/Doom.js';

onMounted(async () => {
  figlet.parseFont('Doom', standard);

  figlet.text('samuhlo', { font: 'Doom' }, (err, art) => {
    if (err || !art) return;

    console.log(
      `%c${art}`,
      'color:#ffca40;font-family:monospace;font-size:13px;line-height:1.3;font-weight:bold',
    );
    console.log('%cProduct Architect', 'color:#888;font-family:sans-serif;font-size:11px');
    console.log('%c ', '');
    console.log(
      '%c GitHub   %chttps://github.com/samuhlo',
      'font-weight:bold;font-family:sans-serif',
      'color:#ffca40;font-family:sans-serif',
    );
    console.log(
      '%c Email    %chola@samuhlo.dev',
      'font-weight:bold;font-family:sans-serif',
      'color:#ffca40;font-family:sans-serif',
    );
    console.log('%c ', '');
  });
});
</script>

<template>
  <span />
</template>
