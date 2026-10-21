import type { Metadata } from "next";
import { site, socialLinks } from "@/data/site";

const shareImage = { url: "/images/hero/hero-poster.jpg", width: 1600, height: 900, alt: `${site.name} — ${site.tagline}` };

/**
 * The metadata every page shares: title, description, canonical URL and the link-preview cards.
 * `canonical` is the URL search engines should list for this page (the phone edition points at "/").
 */
export function pageMetadata({
  path,
  title = site.title,
  description = site.description,
  canonical = path,
}: {
  path: string;
  title?: string;
  description?: string;
  canonical?: string;
}): Metadata {
  return {
    metadataBase: new URL(site.url),
    title,
    description,
    keywords: site.keywords,
    applicationName: site.name,
    authors: [{ name: site.organizer }],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
      url: canonical,
      title: title === site.title ? `${site.name} — ${site.tagline}` : title,
      description: site.shareDescription,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      site: "@saas_ceg",
      title: title === site.title ? `${site.name} — ${site.tagline}` : title,
      description: site.shareDescription,
      images: [shareImage.url],
    },
  };
}

/** schema.org data for search engines: the fest as an Event, organised by SAAS, on this website. */
export function structuredData() {
  const organization = {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: `${site.organizerName} (${site.organizerShort}), CEG`,
    alternateName: ["SAAS CEG", site.organizerShort],
    url: site.saasUrl,
    logo: `${site.url}/icon.png`,
    email: site.email,
    sameAs: socialLinks.map((l) => l.href),
  };
  const place = {
    "@type": "Place",
    name: site.college,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        alternateName: ["AGNI 2026", "Agni 26", "Agni CEG"],
        url: site.url,
        publisher: { "@id": organization["@id"] },
      },
      {
        "@type": "Event",
        "@id": `${site.url}/#event`,
        name: `${site.name} — ${site.theme}`,
        alternateName: "AGNI 2026",
        description: site.description,
        startDate: site.startDate,
        endDate: site.endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: place,
        image: [`${site.url}${shareImage.url}`],
        url: site.url,
        organizer: { "@id": organization["@id"] },
      },
    ],
  };
}

/** The structured data as a JSON-LD <script> body (`<` escaped so the text can never close the tag). */
export const structuredDataJson = () => JSON.stringify(structuredData()).replace(/</g, "\\u003c");
