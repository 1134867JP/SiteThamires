# Vídeos para stories

Fonte dos vídeos em `stories/` (1080×1920, 30 fps, sem áudio).

- `story.html?v=1`: teaser "Novidade chegando..." (11 s)
- `story.html?v=2`: apresentação com foto e especialidades (16 s)

Para gerar de novo (precisa de Playwright + ffmpeg):

```bash
node render.js 1 /tmp/f1 all
ffmpeg -framerate 30 -i /tmp/f1/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 17 -movflags +faststart ../story-teaser-novidade.mp4
```
