// Microsoft Clarity tracking tag (public project ID: zhsd81zz12) + global declarative click-point delegation.
// Any element with [data-clarity-event] automatically logs a Clarity Smart Event, sets `last_cta`,
// and optionally upgrades the session recording when [data-clarity-upgrade] is present.
const CLARITY_PROJECT_ID = "zhsd81zz12";

const claritySnippet = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);l.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest("[data-clarity-event]"):null;if(!el||typeof c[a]!=="function")return;var ev=el.getAttribute("data-clarity-event");var up=el.getAttribute("data-clarity-upgrade");var tg=el.getAttribute("data-clarity-tag");if(ev){c[a]("event",ev);c[a]("set","last_cta",ev);}if(tg){var kv=tg.split(":");if(kv.length===2)c[a]("set",kv[0],kv[1]);}if(up){c[a]("upgrade",up);}},{passive:true});})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;

export default function ClarityScript() {
  return <script id="microsoft-clarity" type="text/javascript" dangerouslySetInnerHTML={{ __html: claritySnippet }} />;
}
