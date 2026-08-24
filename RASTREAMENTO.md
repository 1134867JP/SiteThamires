# Rastreamento de leads

O site registra a origem de campanha por 90 dias no navegador e acompanha estes eventos:

- `whatsapp_click` no GA4 e `WhatsAppClick`/`Contact` no Meta Pixel;
- `generate_lead` no GA4 e `Lead` no Meta Pixel para formulários presentes ou adicionados no futuro;
- conversões diretas do Google Ads quando os respectivos rótulos forem informados.

## Configuração

Edite `tracking-config.js` e informe somente os IDs usados:

```js
window.TRACKING_CONFIG = {
  ga4MeasurementId: "G-XXXXXXXXXX",
  googleAdsId: "AW-XXXXXXXXX",
  googleAdsWhatsappLabel: "ROTULO_WHATSAPP",
  googleAdsFormLabel: "ROTULO_FORMULARIO",
  metaPixelId: "000000000000000"
};
```

Campos vazios não carregam scripts nem enviam eventos.

## UTMs dos anúncios

Use pelo menos:

```text
?utm_source=google&utm_medium=cpc&utm_campaign=nome_da_campanha
?utm_source=facebook&utm_medium=paid_social&utm_campaign=nome_da_campanha
?utm_source=instagram&utm_medium=paid_social&utm_campaign=nome_da_campanha
```

Também são armazenados `utm_term`, `utm_content`, `gclid` e `fbclid`. A primeira e a última origem ficam no `localStorage` e são enviadas somente como parâmetros dos eventos de análise; a mensagem do WhatsApp permanece limpa para o visitante.

## Teste

1. Abra o site com UTMs de teste.
2. Clique em cada chamada para WhatsApp e confirme que a mensagem permanece limpa.
3. Use o DebugView do GA4, o Tag Assistant e o Meta Pixel Helper para validar os eventos.
4. No GA4, marque `whatsapp_click` e `generate_lead` como eventos principais se forem usados como conversão.

O Search Console deve ser mantido para acompanhar SEO e tráfego orgânico; ele não substitui o rastreamento de conversões de anúncios.
