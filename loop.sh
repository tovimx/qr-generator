#!/bin/bash

# Configuración fija
PROMPT_FILE="./prompt.md"
MAX_ITERATIONS=100
LOG_FILE="claude-loop.log"
LASTRUN_FILE="/tmp/claude-loop-lastrun"

# Variables
counter=0
start_time=$(date)

# Función de logging
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Cleanup function
cleanup() {
    log "🛑 Loop interrumpido por usuario en iteración #$counter"
    log "⏱️ Duración total: $(($(date +%s) - $(date -d "$start_time" +%s)))s"
    exit 0
}

# Trap señales
trap cleanup SIGINT SIGTERM

# Validaciones iniciales
if [[ ! -f "$PROMPT_FILE" ]]; then
    log "❌ Error: $PROMPT_FILE no encontrado"
    exit 1
fi

if ! command -v claude &> /dev/null; then
    log "❌ Error: Claude Code no está instalado"
    exit 1
fi

log "🚀 Iniciando Claude Loop con monitoreo y notificaciones"
log "📝 Monitoreando: $PROMPT_FILE"
log "⚡ Modo continuo: Sin delays"

# Main loop
while [[ $counter -lt $MAX_ITERATIONS ]]; do
    
    # 🔍 MONITOREO DE CAMBIOS: Solo ejecutar si prompt.md cambió
    if [[ "$PROMPT_FILE" -nt "$LASTRUN_FILE" ]]; then
        counter=$((counter + 1))
        log "🔄 Iteración #$counter (prompt.md modificado)"
        
        # Actualizar timestamp de última ejecución
        touch "$LASTRUN_FILE"
        
        # Ejecutar Claude
        if cat "$PROMPT_FILE" | claude -p --dangerously-skip-permissions; then
            log "✅ Iteración #$counter exitosa"
            
            # 📢 NOTIFICACIONES: Cada 10 iteraciones
            if [[ $((counter % 10)) -eq 0 ]]; then
                osascript -e "display notification 'Iteración $counter completada' with title 'Claude Loop'" 2>/dev/null
                log "🔔 Notificación enviada para iteración #$counter"
            fi
            
        else
            exit_code=$?
            log "❌ Error en iteración #$counter (exit code: $exit_code)"
        fi
    else
        # Prompt no ha cambiado - monitoreo continuo
        printf "\r⏳ Monitoreando cambios en $PROMPT_FILE... [$(date '+%H:%M:%S')]"
    fi
done

log "🏁 Límite de $MAX_ITERATIONS iteraciones alcanzado"