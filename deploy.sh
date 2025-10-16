#!/bin/bash

# Script para desplegar Life-Syn2 en GitHub Pages

echo "🚀 Iniciando deployment a GitHub Pages..."

# Verificar que estamos en la rama correcta
if [[ $(git branch --show-current) != "main" ]]; then
    echo "❌ Error: Debes estar en la rama 'main' para hacer deployment"
    exit 1
fi

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build:gh-pages

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo "❌ Error: El build falló. No se encontró la carpeta 'dist'"
    exit 1
fi

# Crear carpeta docs si no existe
if [ ! -d "../docs" ]; then
    echo "📁 Creando carpeta docs..."
    mkdir ../docs
fi

# Copiar archivos de dist a docs
echo "📋 Copiando archivos..."
cp -r dist/* ../docs/

# Ir al directorio raíz del proyecto
cd ..

# Agregar cambios
echo "📝 Agregando cambios..."
git add docs/

# Commit
echo "💾 Haciendo commit..."
git commit -m "Deploy to GitHub Pages - $(date)"

# Push
echo "🚀 Haciendo push..."
git push origin main

echo "✅ Deployment completado!"
echo "🌐 Tu aplicación estará disponible en: https://tu-usuario.github.io/Life-Syn2/"
echo "⏰ Puede tomar unos minutos en estar disponible." 