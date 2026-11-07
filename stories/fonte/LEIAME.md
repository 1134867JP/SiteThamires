# Vídeo para stories

Fonte de `stories/story-teaser-novidade.mp4` (1080×1920, 30 fps, 11 s, sem áudio):
teaser "Novidade chegando..." com o logo oficial (`logo-original.png`,
recortado em `logo-*.png` para animar cada parte).

Para gerar de novo (precisa de Playwright + ffmpeg):

```bash
node render.js /tmp/frames all
ffmpeg -framerate 30 -i /tmp/frames/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 17 -movflags +faststart ../story-teaser-novidade.mp4
```
