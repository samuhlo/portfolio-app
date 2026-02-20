#!/bin/bash

# =============================================================================
# SETUP LINTING — Vue 3 / Nuxt 3 + TypeScript
# =============================================================================
# DESC:   Configura ESLint 9, Prettier y settings de editor en un proyecto
#         Vue 3 o Nuxt 3 con TypeScript.
# USAGE:  bash setup-linting.sh
# =============================================================================

set -euo pipefail

# =============================================================================
# UTILIDADES
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log_info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
log_success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
log_error()   { echo -e "${RED}[ERR]${RESET}   $1" >&2; }
to_upper()    { echo "$1" | tr '[:lower:]' '[:upper:]'; }

run() {
  local description="$1"
  shift
  log_info "$description"
  if ! "$@"; then
    log_error "Fallo en: $description"
    log_error "Comando: $*"
    exit 1
  fi
}

write_file() {
  local filepath="$1"
  local content="$2"
  echo "$content" > "$filepath" || { log_error "No se pudo escribir: $filepath"; exit 1; }
  log_success "Creado: $filepath"
}

# =============================================================================
# VERIFICACIONES PREVIAS
# =============================================================================

check_prerequisites() {
  log_info "Verificando prerequisitos..."

  if ! command -v node &> /dev/null; then
    log_error "Node.js no encontrado. Instálalo desde https://nodejs.org"
    exit 1
  fi

  if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script en la raíz del proyecto."
    exit 1
  fi

  log_success "Node $(node -v)"
}

# =============================================================================
# SELECCIÓN INTERACTIVA
# =============================================================================

select_package_manager() {
  echo ""
  echo -e "${BOLD}¿Qué gestor de paquetes usas?${RESET}"
  echo "  1) bun"
  echo "  2) pnpm"
  echo "  3) npm"
  echo "  4) yarn"
  echo ""
  read -rp "Selección [1/2/3/4]: " choice

  case "$choice" in
    1) PKG_MANAGER="bun"  ;;
    2) PKG_MANAGER="pnpm" ;;
    3) PKG_MANAGER="npm"  ;;
    4) PKG_MANAGER="yarn" ;;
    *)
      log_error "Opción inválida: '$choice'. Escribe 1, 2, 3 o 4."
      exit 1
      ;;
  esac

  # Verificar que el gestor elegido está instalado
  if ! command -v "$PKG_MANAGER" &> /dev/null; then
    log_error "'$PKG_MANAGER' no encontrado. Instálalo primero."
    exit 1
  fi

  log_success "Gestor: $PKG_MANAGER ($(${PKG_MANAGER} --version))"
}

select_project_type() {
  echo ""
  echo -e "${BOLD}¿Qué tipo de proyecto es?${RESET}"
  echo "  1) Vue 3 + Vite"
  echo "  2) Nuxt 3"
  echo ""
  read -rp "Selección [1/2]: " choice

  case "$choice" in
    1) PROJECT_TYPE="vue"  ;;
    2) PROJECT_TYPE="nuxt" ;;
    *)
      log_error "Opción inválida: '$choice'. Escribe 1 o 2."
      exit 1
      ;;
  esac

  log_success "Proyecto: $(to_upper "$PROJECT_TYPE")"
}

select_editors() {
  echo ""
  echo -e "${BOLD}¿Qué editor(es) usas?${RESET}"
  echo "  1) VS Code"
  echo "  2) Cursor / Windsurf"
  echo "  3) Ambos"
  echo ""
  read -rp "Selección [1/2/3]: " choice

  case "$choice" in
    1) EDITORS=("vscode")            ;;
    2) EDITORS=("cursor")            ;;
    3) EDITORS=("vscode" "cursor")   ;;
    *)
      log_error "Opción inválida: '$choice'. Escribe 1, 2 o 3."
      exit 1
      ;;
  esac

  log_success "Editor(es): ${EDITORS[*]}"
}

# =============================================================================
# INSTALACIÓN DE DEPENDENCIAS
# =============================================================================

# Devuelve el comando de instalación correcto para cada gestor
pkg_install() {
  case "$PKG_MANAGER" in
    bun)  echo "bun add -d" ;;
    pnpm) echo "pnpm add -D" ;;
    npm)  echo "npm install -D" ;;
    yarn) echo "yarn add -D" ;;
  esac
}

# Devuelve el comando de ejecución de scripts para cada gestor
pkg_run() {
  case "$PKG_MANAGER" in
    bun)  echo "bun run" ;;
    pnpm) echo "pnpm run" ;;
    npm)  echo "npm run" ;;
    yarn) echo "yarn" ;;
  esac
}

install_dependencies() {
  echo ""
  log_info "Instalando dependencias para $(to_upper "$PROJECT_TYPE") con $PKG_MANAGER..."

  local BASE_DEPS=(
    "eslint@9"
    "eslint-plugin-vue"
    "@vue/eslint-config-typescript"
    "@vue/eslint-config-prettier"
    "prettier"
    "typescript"
  )

  local NUXT_DEPS=(
    "@nuxt/eslint"
  )

  local INSTALL_CMD
  INSTALL_CMD=$(pkg_install)

  if [ "$PROJECT_TYPE" = "nuxt" ]; then
    run "Instalando deps" $INSTALL_CMD "${BASE_DEPS[@]}" "${NUXT_DEPS[@]}"
  else
    run "Instalando deps" $INSTALL_CMD "${BASE_DEPS[@]}"
  fi

  log_success "Dependencias instaladas"
}

# =============================================================================
# ARCHIVOS DE CONFIGURACIÓN
# =============================================================================

create_prettierrc() {
  write_file ".prettierrc" '{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}'
}

create_eslint_config_vue() {
  write_file "eslint.config.js" "import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  skipFormatting,
)"
}

create_eslint_config_nuxt() {
  write_file "eslint.config.mjs" "// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default withNuxt(
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/.nuxt/**', '**/.output/**'],
  },
  skipFormatting,
)"

  log_warn "Nuxt genera '.nuxt/eslint.config.mjs' al hacer '$(pkg_run) dev'."
  log_warn "Asegúrate de tener el módulo @nuxt/eslint en nuxt.config.ts:"
  echo -e "         ${CYAN}modules: ['@nuxt/eslint']${RESET}"
}

create_prettier_ignore() {
  write_file ".prettierignore" "dist
.nuxt
.output
node_modules
*.min.js"
}

# =============================================================================
# CONFIGURACIÓN DE EDITORES
# =============================================================================

EDITOR_SETTINGS='{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}'

configure_editors() {
  for editor in "${EDITORS[@]}"; do
    case "$editor" in
      vscode)
        mkdir -p .vscode
        write_file ".vscode/settings.json" "$EDITOR_SETTINGS"
        ;;
      cursor)
        mkdir -p .cursor
        write_file ".cursor/settings.json" "$EDITOR_SETTINGS"
        ;;
    esac
  done
}

# =============================================================================
# SCRIPTS EN PACKAGE.JSON
# =============================================================================

add_package_scripts() {
  if node -e "const p = require('./package.json'); process.exit(p.scripts?.lint ? 0 : 1)" 2>/dev/null; then
    log_warn "Script 'lint' ya existe en package.json. Omitiendo."
    return
  fi

  log_info "Añadiendo scripts a package.json..."

  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.lint = 'eslint . --fix';
    pkg.scripts.format = 'prettier --write .';
    pkg.scripts['lint:check'] = 'eslint .';
    pkg.scripts['format:check'] = 'prettier --check .';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  " || { log_warn "No se pudieron añadir scripts a package.json. Hazlo manualmente."; return; }

  log_success "Scripts añadidos: lint, format, lint:check, format:check"
}

# =============================================================================
# RESUMEN FINAL
# =============================================================================

print_summary() {
  local RUN_CMD
  RUN_CMD=$(pkg_run)

  echo ""
  echo -e "${BOLD}============================================================${RESET}"
  echo -e "${GREEN}  CONFIGURACION COMPLETADA${RESET}"
  echo -e "${BOLD}============================================================${RESET}"
  echo ""
  echo -e "  Proyecto  : ${CYAN}$(to_upper "$PROJECT_TYPE")${RESET}"
  echo -e "  Gestor    : ${CYAN}$PKG_MANAGER${RESET}"
  echo -e "  Editor(es): ${CYAN}${EDITORS[*]}${RESET}"
  echo ""
  echo -e "  Archivos creados:"

  [ "$PROJECT_TYPE" = "vue" ]  && echo "    · eslint.config.js"
  [ "$PROJECT_TYPE" = "nuxt" ] && echo "    · eslint.config.mjs"
  echo "    · .prettierrc"
  echo "    · .prettierignore"

  for editor in "${EDITORS[@]}"; do
    [ "$editor" = "vscode" ] && echo "    · .vscode/settings.json"
    [ "$editor" = "cursor" ] && echo "    · .cursor/settings.json"
  done

  echo ""
  echo -e "  Próximos pasos:"

  if [ "$PROJECT_TYPE" = "nuxt" ]; then
    echo -e "    1. Añade ${CYAN}@nuxt/eslint${RESET} a modules en nuxt.config.ts"
    echo -e "    2. Ejecuta ${CYAN}$RUN_CMD dev${RESET} para generar .nuxt/eslint.config.mjs"
    echo -e "    3. Ejecuta ${CYAN}$RUN_CMD lint${RESET} para verificar"
  else
    echo -e "    1. Reinicia el editor"
    echo -e "    2. Ejecuta ${CYAN}$RUN_CMD lint${RESET} para verificar"
    echo -e "    3. Ejecuta ${CYAN}$RUN_CMD format${RESET} para formatear"
  fi

  echo ""
}

# =============================================================================
# MAIN
# =============================================================================

main() {
  echo ""
  echo -e "${BOLD}  SETUP LINTING — Vue 3 / Nuxt 3${RESET}"
  echo -e "  ESLint 9 + Prettier + TypeScript"
  echo ""

  check_prerequisites
  select_package_manager
  select_project_type
  select_editors
  install_dependencies

  echo ""
  log_info "Generando archivos de configuración..."

  create_prettierr
  create_prettier_ignore

  if [ "$PROJECT_TYPE" = "vue" ]; then
    create_eslint_config_vue
  else
    create_eslint_config_nuxt
  fi

  configure_editors
  add_package_scripts
  print_summary
}

main