---
title: "Week 07: The Setup Ritual"
description: "Esta semana rediseñé mi entorno de desarrollo desde cero. Nuevo terminal, nuevos dotfiles, y una reflexión sobre por qué el tooling importa más de lo que creemos."
date: "2026-02-14"
category: "weekly_log"
topics: ["tooling", "dx", "terminal", "productividad"]
time_to_read: 6
published: true
slug: "week-07-the-setup-ritual"
---

# Week 07: The Setup Ritual

Hay semanas donde no escribes ni una línea de código de producto y aún así sientes que avanzaste más que nunca. Esta fue una de esas.

## Lo que hice

Llevaba meses arrastrando una configuración de terminal que era un Frankenstein de copiar-pegar de dotfiles ajenos. Funcionaba, pero no era *mía*. Este fin de semana decidí empezar de cero.

El resultado: un setup con Wezterm como emulador, Zsh con un prompt custom mínimo (nada de Oh My Zsh, solo lo que necesito), Neovim con una config en Lua que entiendo línea por línea, y tmux con keybindings que por fin tienen sentido para mi cerebro.

El proceso me llevó casi dos días completos. ¿Merece la pena dedicar dos días a configurar herramientas? Absolutamente.

## Lo técnico

Lo más interesante del proceso fue darme cuenta de cuántas cosas tenía configuradas que nunca usaba. Mi antiguo `.zshrc` tenía 200 líneas. El nuevo tiene 47. Y hace más, porque cada línea está ahí por una razón.

Algunos highlights del setup:

```bash
# Mi alias favorito: abrir el proyecto actual en el editor
alias dev="tmux new-session -s $(basename $(pwd))"
```

La clave fue documentar cada decisión. Creé un README en mi repo de dotfiles explicando no solo el *qué* sino el *por qué*. Cuando dentro de seis meses me pregunte por qué uso esa opción específica de Neovim, tendré la respuesta.

También migré de npm a pnpm definitivamente. La diferencia en espacio en disco es absurda. En mis proyectos de Nuxt pasé de ~800MB de node_modules a ~350MB. Mismo resultado, la mitad de peso.

## Lo que aprendí

Que la velocidad no es solo tipear rápido. Es reducir la fricción entre lo que piensas y lo que ejecutas. Si cada vez que quiero abrir un proyecto tengo que recordar tres comandos, eso es fricción. Si mi terminal tarda 2 segundos en cargar por plugins que no uso, eso es fricción.

La DX empieza en tu propia máquina.

## Lo que consumí

Descubrí el canal de ThePrimeagen en YouTube. Su serie sobre Neovim me hizo replantear mi workflow completo. No estoy de acuerdo con todo lo que dice (el hype anti-VSCode me parece innecesario), pero su filosofía de *entender tus herramientas* en lugar de solo usarlas me resonó mucho.

También leí un artículo de Wes Bos sobre cómo organiza sus dotfiles que me dio la idea de versionar todo con stow.

## Para la próxima semana

Empezar el desarrollo real del portfolio. Ya tengo el setup listo, los wireframes aprobados, y el diseño Hi-Fi en Figma. Toca abrir VS Code (sí, sigo usando VS Code para proyectos grandes, fight me) y empezar a picar.

El objetivo es tener el scaffolding de Nuxt 3 con TresJS corriendo, el sistema de capas (Canvas Curtain) funcionando, y al menos un modelo 3D renderizándose en el fondo.

## Reflexión

Hay una línea fina entre optimizar tu workflow y procrastinar disfrazado de productividad. Creo que esta semana estuvo del lado correcto, pero es un equilibrio delicado. La próxima vez que sienta la urgencia de "mejorar mi setup", me voy a preguntar: ¿esto me acerca a publicar algo, o me aleja?
