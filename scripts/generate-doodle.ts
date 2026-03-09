/**
 * █ [SCRIPT] :: GENERATE DOODLE
 * =====================================================================
 * DESC:   Convierte un SVG doodle en un componente Vue listo para usar.
 *         Parsea el export de Serif/Illustrator, limpia namespaces,
 *         y genera props reactivas con CSS variables.
 *
 * USAGE:  bun run doodle <svg-source> <vue-output>
 *         Rutas relativas a app/assets/svg/ y app/components/ui/doodles/
 *
 * STATUS: STABLE
 * =====================================================================
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

// =============================================================================
// █ CORE: CONSTANTS
// =============================================================================

const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const SVG_BASE_DIR = join(PROJECT_ROOT, 'app/assets/svg');
const VUE_BASE_DIR = join(PROJECT_ROOT, 'app/components/ui/doodles');

const DEFAULT_STROKE_COLOR = '#ffca40';
const DEFAULT_STROKE_WIDTH = 5;

// =============================================================================
// █ CORE: TYPES
// =============================================================================

interface ParsedSvg {
  viewBox: string;
  innerContent: string;
  strokeWidth: number;
  hasFill: boolean;
}

// =============================================================================
// █ CORE: SVG PARSER
// =============================================================================

function parseSvg(rawSvg: string): ParsedSvg {
  // Extraer viewBox
  const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    throw new Error('SVG sin viewBox. Abortando.');
  }
  const viewBox = viewBoxMatch[1];

  // Detectar stroke-width original del SVG para usar como default
  const strokeWidthMatch = rawSvg.match(/stroke-width:(\d+(?:\.\d+)?)px/);
  const strokeWidth = strokeWidthMatch
    ? Math.round(Number(strokeWidthMatch[1]))
    : DEFAULT_STROKE_WIDTH;

  // Detectar si hay fills no-none
  const hasFill = /fill:(?!none)/.test(rawSvg) || /fill="(?!none")[^"]+/.test(rawSvg);

  // Extraer contenido interior del <svg> raíz
  const svgContentMatch = rawSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!svgContentMatch) {
    throw new Error('No se pudo extraer contenido del SVG.');
  }

  let innerContent = svgContentMatch[1];

  // Limpiar el contenido
  innerContent = cleanSvgContent(innerContent, strokeWidth);

  return { viewBox, innerContent, strokeWidth, hasFill };
}

function cleanSvgContent(content: string, defaultStrokeWidth: number): string {
  let cleaned = content;

  // Reemplazar style inline de paths por atributos individuales reactivos
  // Patrón: style="fill:none;stroke:rgb(255,202,64);stroke-width:4px;"
  cleaned = cleaned.replace(/\s*style="([^"]*)"/g, (_match, styleStr: string) => {
    // Parsear el style inline
    const styles = parseInlineStyle(styleStr);

    const attrs: string[] = [];

    // Fill
    if (styles['fill'] && styles['fill'] !== 'none') {
      attrs.push(`fill="var(--doodle-stroke-color, ${DEFAULT_STROKE_COLOR})"`);
    }

    // Stroke
    if (styles['stroke']) {
      attrs.push(`stroke="var(--doodle-stroke-color, ${DEFAULT_STROKE_COLOR})"`);
    }

    // Stroke width
    if (styles['stroke-width']) {
      attrs.push(`stroke-width="var(--doodle-stroke-width, ${defaultStrokeWidth})"`);
    }

    // Stroke linecap
    if (styles['stroke-linecap']) {
      attrs.push(`stroke-linecap="${styles['stroke-linecap']}"`);
    } else if (styles['stroke']) {
      attrs.push('stroke-linecap="round"');
    }

    // Stroke linejoin
    if (styles['stroke-linejoin']) {
      attrs.push(`stroke-linejoin="${styles['stroke-linejoin']}"`);
    } else if (styles['stroke']) {
      attrs.push('stroke-linejoin="round"');
    }

    if (attrs.length === 0) return '';

    return '\n        ' + attrs.join('\n        ');
  });

  // Limpiar tags de identidad innecesarios
  cleaned = cleaned.replace(/\s*xmlns:serif="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s*xml:space="[^"]*"/g, '');

  // Normalizar indentación (SVGs exportados usan 8 espacios, queremos 4)
  cleaned = normalizeIndentation(cleaned);

  return cleaned.trim();
}

function parseInlineStyle(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  const parts = styleStr.split(';').filter(Boolean);

  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;

    const key = part.slice(0, colonIndex).trim();
    let value = part.slice(colonIndex + 1).trim();

    // Convertir rgb() a hex
    const rgbMatch = value.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (rgbMatch) {
      const r = Number(rgbMatch[1]);
      const g = Number(rgbMatch[2]);
      const b = Number(rgbMatch[3]);
      value = rgbToHex(r, g, b);
    }

    // Limpiar unidades para stroke-width
    if (key === 'stroke-width') {
      value = value.replace('px', '');
    }

    styles[key] = value;
  }

  return styles;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function normalizeIndentation(content: string): string {
  const lines = content.split('\n');
  return lines
    .map((line) => {
      // Convertir la indentación base del SVG a indentación del template Vue
      const match = line.match(/^(\s*)/);
      if (!match) return line;

      const spaces = match[1].length;
      // SVGs de Serif usan 4 espacios base. Los convertimos a indentación del template (base 4)
      const newIndent = ' '.repeat(Math.max(0, spaces));
      return newIndent + line.trimStart();
    })
    .join('\n');
}

// =============================================================================
// █ CORE: VUE GENERATOR
// =============================================================================

function deriveComponentName(filename: string): string {
  // DoodleCircleWord.vue -> DOODLE CIRCLE WORD
  const name = basename(filename, '.vue');
  return name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toUpperCase();
}

function generateVueComponent(parsed: ParsedSvg, outputFilename: string): string {
  const componentName = deriveComponentName(outputFilename);

  const fillAttr = parsed.hasFill ? '' : '\n    fill="none"';

  return `<script setup lang="ts">
/**
 * █ [UI_ATOM] :: ${componentName}
 * =====================================================================
 * DESC:   SVG doodle generado automáticamente desde assets.
 * STATUS: STABLE
 * =====================================================================
 */
import { ref } from 'vue';

withDefaults(
  defineProps<{
    strokeWidth?: number;
    strokeColor?: string;
  }>(),
  {
    strokeWidth: ${parsed.strokeWidth},
    strokeColor: '${DEFAULT_STROKE_COLOR}',
  },
);

const svgRef = ref<SVGSVGElement | null>(null);
defineExpose({ svg: svgRef });
</script>

<template>
  <svg
    ref="svgRef"
    viewBox="${parsed.viewBox}"${fillAttr}
    :style="{
      '--doodle-stroke-width': strokeWidth + 'px',
      '--doodle-stroke-color': strokeColor,
    }"
  >
    ${parsed.innerContent}
  </svg>
</template>

<style scoped>
svg {
  overflow: visible;
}
</style>
`;
}

// =============================================================================
// █ CORE: CLI ENTRY
// =============================================================================

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`[ERR]    :: ARGS_MISSING :: Uso: bun run doodle <svg-source> <vue-output>`);
    console.error(
      `         :: EXAMPLE      :: bun run doodle bio/circle_word.svg bio/DoodleCircleWord.vue`,
    );
    process.exit(1);
  }

  const [svgRelPath, vueRelPath] = args;

  const svgPath = join(SVG_BASE_DIR, svgRelPath);
  const vuePath = join(VUE_BASE_DIR, vueRelPath);

  // Validar que el SVG origen existe
  if (!existsSync(svgPath)) {
    console.error(`[ERR]    :: NOT_FOUND    :: SVG no encontrado: ${svgPath}`);
    process.exit(1);
  }

  // Validar extensiones
  if (!svgRelPath.endsWith('.svg')) {
    console.error(`[ERR]    :: BAD_EXT      :: El archivo fuente debe ser .svg`);
    process.exit(1);
  }
  if (!vueRelPath.endsWith('.vue')) {
    console.error(`[ERR]    :: BAD_EXT      :: El archivo destino debe ser .vue`);
    process.exit(1);
  }

  // Leer y parsear SVG
  console.log(`[INFO]   >> READING      :: ${svgRelPath}`);
  const rawSvg = readFileSync(svgPath, 'utf-8');
  const parsed = parseSvg(rawSvg);

  // Generar componente Vue
  console.log(`[INFO]   >> GENERATING   :: ${vueRelPath}`);
  const vueContent = generateVueComponent(parsed, basename(vueRelPath));

  // Crear directorios intermedios si no existen
  const vueDir = dirname(vuePath);
  if (!existsSync(vueDir)) {
    mkdirSync(vueDir, { recursive: true });
    console.log(`[INFO]   ++ DIR_CREATED  :: ${vueDir}`);
  }

  // Escribir el archivo
  writeFileSync(vuePath, vueContent, 'utf-8');
  console.log(`[INFO]   ++ SAVED        :: ${vuePath}`);
  console.log(
    `[INFO]   :: PROPS        :: strokeWidth: ${parsed.strokeWidth} | strokeColor: ${DEFAULT_STROKE_COLOR}`,
  );
}

main();
