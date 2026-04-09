<script setup lang="ts">
/**
 * █ [FEATURE] :: CONSOLE MESSAGE
 * =====================================================================
 * DESC:   Inyecta Easter Egg (ASCII Art + Info) en la terminal de Chrome.
 * STATUS: STABLE
 * =====================================================================
 */
import { onMounted } from 'vue';
import { SITE, COLORS } from '~/config/site';

onMounted(async () => {
  // [NOTE] Lazy import → figlet + font Doom (~30KB+) solo se cargan tras el mount,
  // fuera del bundle principal. Es un easter egg de consola, no necesita ser inmediato.
  const [{ default: figlet }, { default: standard }] = await Promise.all([
    import('figlet'),
    import('figlet/importable-fonts/Doom.js'),
  ]);

  figlet.parseFont('Doom', standard);

  figlet.text(SITE.authorHandle, { font: 'Doom' }, (err, art) => {
    if (err || !art) return;

    console.log(
      `%c${art}`,
      `color:${COLORS.accent};font-family:monospace;font-size:13px;line-height:1.3;font-weight:bold`,
    );
    console.log('%cProduct Architect', 'color:#888;font-family:sans-serif;font-size:11px');
    console.log('%c ', '');
    console.log(
      '%c GitHub   %c' + SITE.github,
      'font-weight:bold;font-family:sans-serif',
      `color:${COLORS.accent};font-family:sans-serif`,
    );
    console.log(
      '%c Email    %c' + SITE.email,
      'font-weight:bold;font-family:sans-serif',
      `color:${COLORS.accent};font-family:sans-serif`,
    );
    console.log('%c ', '');
  });
});
</script>

<template>
  <span />
</template>
