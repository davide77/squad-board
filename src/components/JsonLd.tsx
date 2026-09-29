interface JsonLdProps {
  readonly data: object;
}

// Escapes "<" so nothing in the data can close the script tag early.
const SCRIPT_CLOSE = /</g;
const SAFE_LT = "\\u003c";

/** Structured data for search engines, rendered on the server. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(SCRIPT_CLOSE, SAFE_LT) }}
    />
  );
}
