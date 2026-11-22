// Google Analytics 4 (GA4) Measurement Tag — Firebase Project: bdimexport64 (App: bdimexport-web).
// Rendered directly inside <head> across all 14 locale root layouts (async, zero render-blocking, GSC GA4 verification compatible).
export const GA_MEASUREMENT_ID = "G-1PXMK93V3F";
export const GOOGLE_SITE_VERIFICATION = "";

const gtagInitSnippet = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`;

export default function GoogleAnalyticsScript() {
  return (
    <>
      {GOOGLE_SITE_VERIFICATION ? (
        <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
      ) : null}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script id="google-analytics-ga4" dangerouslySetInnerHTML={{ __html: gtagInitSnippet }} />
    </>
  );
}
