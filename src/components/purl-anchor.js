import React from "react";

// Accepts the id used as the perma-URL path redirect and transforms it into an
// element with an id that will match the fragment generated by the matching
// redirect in static/_redirects.
// For use in documentation that will be linked to in external application UIs.
// Expected format:
//   /purl/<product-code>/<reference-name>/
// ...where <product-code> will be a short, stable name for the product (e.g. "pgd", "upm", "epas"),
// and <reference-name> will be a meaningful description of the expected content being linked to.
// Both parameters must be composed of characters valid in URL fragments; invalid characters will *not* be escaped!
// I recommend you limit these parameters to words containing alphanumeric characters, separated by dashes.
//
// This component is intentionally bare-bones right now; it's a component for only two reasons
// 1. it performs transformation and some limited validation of the id (ensure that it fits with the scheme expected by the matching redirect in static/_redirects)
// 2. it makes the purpose of the anchor more obvious when scanning the source Markdown
//    (and hopefully when reorganizing content)
//
// Note that you *must* list the path passed to this function in the frontmatter
// redirects section of the file where it appears; I may automate that or at least
// validate it at some point in the future if this sees enough use to make that useful.
//
const PurlAnchor = ({ urlPath }) => {
  if (!urlPath?.replace) {
    console.error("PurlAnchor requires a urlPath property");
    return;
  }

  let hash = urlPath
    .replace(/^\/?purl\/?/, "")
    .split("/")
    .filter((s) => s)
    .join("_");

  if (!/^\/purl\/[^/]+\/[^/]+/.test(urlPath))
    console.error(
      `PurlAnchor given a badly-formatted URL path: ${urlPath}; format must be /purl/<product>/<reference-name> - anchor id will be ${hash}`,
    );

  // h/t https://stackoverflow.com/questions/26088849/url-fragment-allowed-characters/26119120#26119120
  if (!/^([-?/:@._~!$&'()*+,;=a-zA-Z0-9]|%[0-9a-fA-F]{2})*$/.test(hash))
    console.error(
      `PurlAnchor given a badly-formatted URL path: ${urlPath}; this results in an anchor id of ${hash}, which is invalid as a URL fragment`,
    );

  return <span ref={snapToNearestSection} id={hash} />;
};

function snapToNearestSection(node) {
  if (
    !node ||
    decodeURIComponent(window?.location?.hash?.substring(1)) !== node.id
  )
    return;

  // walk backwards and find nearest previous sibling which is a header with an id, then use *that* id
  // this is a "nice to have", as it makes it more likely that both the URL and section
  // are those defined by the document structure (sections) vs. arbitrary ids.
  for (let next = node.previousSibling; next; next = next.previousSibling) {
    const prevId = next.getAttribute && next.getAttribute("id");
    if (prevId && /H\d/.test(next.nodeName)) {
      window.history.replaceState(null, null, "#" + encodeURIComponent(prevId));
      break;
    }
  }
}

export default PurlAnchor;
