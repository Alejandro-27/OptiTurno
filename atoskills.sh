#!/usr/bin/env bash
# atoskills.sh — Instalador y gestor de skills de agentes para OptiTurno.
# Permite reinstalar/actualizar skills desde los registros oficiales y
# sincronizarlas entre la raíz, backend/ y frontend/.
#
# Uso:
#   ./atoskills.sh status    # Muestra skills instaladas por destino
#   ./atoskills.sh install   # Instala/actualiza skills desde registros (requiere red)
#   ./atoskills.sh sync      # Copia skills locales entre destinos (sin red)
#   ./atoskills.sh update    # Fuerza re-descarga de registros + sync
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE_DIR="$ROOT_DIR/.cache/atoskills"
AGENTS_ROOT="$ROOT_DIR/.agents/skills"
AGENTS_BACKEND="$ROOT_DIR/backend/.agents/skills"
AGENTS_FRONTEND="$ROOT_DIR/frontend/.agents/skills"

# Registros (repo GitHub → lista de skills que aporta). Fuentes probadas:
# verificadas en skills-lock.json de backend/ y frontend/.
declare -A REGISTRIES=(
  ["supabase/agent-skills"]="supabase-postgres-best-practices"
  ["wshobson/agents"]="typescript-advanced-types"
  ["addyosmani/web-quality-skills"]="accessibility seo"
  ["vercel-labs/agent-skills"]="composition-patterns react-best-practices deploy-to-vercel"
  ["anthropics/skills"]="frontend-design"
  ["giuseppe-trisciuoglio/developer-kit"]="tailwind-css-patterns"
  ["antfu/skills"]="vite"
)

# Skills sin registro conocido: solo se sincronizan entre destinos
LOCAL_SKILLS="nodejs-backend-patterns nodejs-best-practices"

# Skills por destino
ROOT_ALL=""
BACKEND_SKILLS="supabase-postgres-best-practices typescript-advanced-types"
FRONTEND_SKILLS="accessibility composition-patterns frontend-design react-best-practices seo supabase-postgres-best-practices tailwind-css-patterns typescript-advanced-types vite"

# ---- helpers ----
log()  { printf "\033[1;34m[atoskills]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[atoskills]\033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m[atoskills]\033[0m %s\n" "$*" >&2; exit 1; }

# Encuentra la carpeta de una skill dentro de un repo clonado
find_skill_dir() {
  local repo="$1" skill="$2"
  find "$CACHE_DIR/$repo" -type f -name "SKILL.md" 2>/dev/null \
    | grep -i "/${skill}/SKILL.md$" | head -1 | xargs -r dirname
}

# ---- comandos ----
cmd_status() {
  local target
  for target in "raiz" "backend" "frontend"; do
    local dir
    case "$target" in
      raiz)    dir="$AGENTS_ROOT" ;;
      backend) dir="$AGENTS_BACKEND" ;;
      frontend) dir="$AGENTS_FRONTEND" ;;
    esac
    log "Skills en $target ($dir):"
    if [ -d "$dir" ]; then
      for s in "$dir"/*/; do
        [ -d "$s" ] || continue
        local name hash
        name="$(basename "$s")"
        hash="$(find "$s" -type f -exec sha256sum {} \; | sha256sum | cut -c1-12)"
        printf "  %-38s hash:%s\n" "$name" "$hash"
      done
    else
      warn "  (no existe $dir)"
    fi
  done
}

clone_registries() {
  mkdir -p "$CACHE_DIR"
  for repo in "${!REGISTRIES[@]}"; do
    if [ ! -d "$CACHE_DIR/$repo/.git" ]; then
      log "Clonando $repo ..."
      git clone --depth 1 --quiet "https://github.com/$repo.git" "$CACHE_DIR/$repo" || warn "No se pudo clonar $repo (sin red?)"
    fi
  done
}

install_skill_from_registry() {
  local skill="$1" dest="$2"
  for repo in "${!REGISTRIES[@]}"; do
    [[ " ${REGISTRIES[$repo]} " == *" $skill "* ]] || continue
    local src
    src="$(find_skill_dir "$repo" "$skill")"
    if [ -n "$src" ]; then
      mkdir -p "$dest"
      rm -rf "$dest/$skill"
      cp -r "$src" "$dest/$skill"
      log "  instalada '$skill' en $dest (desde $repo)"
      return 0
    fi
  done
  warn "  skill '$skill' no encontrada en los registros; usa ./atoskills.sh sync si ya existe localmente"
  return 1
}

sync_local() {
  # Copia skills locales (sin registro) desde la raíz hacia backend/frontend
  for skill in $LOCAL_SKILLS; do
    for dest in "$AGENTS_BACKEND" "$AGENTS_FRONTEND"; do
      if [ -d "$AGENTS_ROOT/$skill" ]; then
        mkdir -p "$dest"
        rm -rf "$dest/$skill"
        cp -r "$AGENTS_ROOT/$skill" "$dest/$skill"
        log "  sincronizada '$skill' → $dest"
      fi
    done
  done
}

cmd_install() {
  clone_registries
  log "Instalando skills en raíz..."
  mkdir -p "$AGENTS_ROOT"
  for repo in "${!REGISTRIES[@]}"; do
    for skill in ${REGISTRIES[$repo]}; do
      install_skill_from_registry "$skill" "$AGENTS_ROOT" || true
    done
  done
  cmd_sync
}

cmd_sync() {
  log "Sincronizando skills a backend/ y frontend/..."
  local skill
  for skill in $BACKEND_SKILLS; do
    if [ -d "$AGENTS_ROOT/$skill" ]; then
      mkdir -p "$AGENTS_BACKEND"
      rm -rf "$AGENTS_BACKEND/$skill"
      cp -r "$AGENTS_ROOT/$skill" "$AGENTS_BACKEND/$skill"
      log "  '$skill' → backend/.agents/skills"
    fi
  done
  for skill in $FRONTEND_SKILLS; do
    if [ -d "$AGENTS_ROOT/$skill" ]; then
      mkdir -p "$AGENTS_FRONTEND"
      rm -rf "$AGENTS_FRONTEND/$skill"
      cp -r "$AGENTS_ROOT/$skill" "$AGENTS_FRONTEND/$skill"
      log "  '$skill' → frontend/.agents/skills"
    fi
  done
  sync_local
  log "Sync completado."
}

cmd_update() {
  rm -rf "$CACHE_DIR"
  cmd_install
}

# ---- main ----
case "${1:-status}" in
  status)  cmd_status ;;
  install) cmd_install ;;
  sync)    cmd_sync ;;
  update)  cmd_update ;;
  *)
    echo "Uso: $0 {status|install|sync|update}" >&2
    exit 1
    ;;
esac