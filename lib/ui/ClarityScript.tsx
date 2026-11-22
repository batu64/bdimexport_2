// Microsoft Clarity tracking tag (public project ID: zhsd81zz12).
// Injected into <head> across all public locale root layouts (async, non-blocking).
const CLARITY_PROJECT_ID = "zhsd81zz12";

const claritySnippet = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;

export default function ClarityScript() {
  return <script id="microsoft-clarity" type="text/javascript" dangerouslySetInnerHTML={{ __html: claritySnippet }} />;
}
