/**
 * Turns a package-builder configuration into the requirement a client would
 * have written themselves — plain prose, no bullet lists or product codes, so
 * the sales team reads an actual brief rather than a machine dump.
 */

/** "a, b and c" — an Oxford-free list that reads naturally mid-sentence. */
function joinNatural(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export interface RequirementInput {
  planName: string;
  /** Service areas bundled with the chosen tier. */
  includedServices: string[];
  /** Extras the client added on top of the tier. */
  extraServices: string[];
  /** Free-text requests typed into the builder's custom box. */
  customRequests: string[];
}

export function buildRequirementSummary({
  planName,
  includedServices,
  extraServices,
  customRequests,
}: RequirementInput): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `We are looking at the ${planName} package for our cloud environment and would like a detailed scope and quote.`,
  );

  if (includedServices.length > 0) {
    paragraphs.push(
      `Under this plan we expect coverage for ${joinNatural(includedServices)}.`,
    );
  }

  if (extraServices.length > 0) {
    paragraphs.push(
      `On top of the plan, we would also like to include ${joinNatural(extraServices)}.`,
    );
  }

  if (customRequests.length > 0) {
    paragraphs.push(
      customRequests.length === 1
        ? `We have one specific requirement of our own: ${customRequests[0]}.`
        : `We also have some specific requirements of our own: ${joinNatural(customRequests)}.`,
    );
  }

  paragraphs.push(
    'Please confirm what is covered, the onboarding timeline, and the commercials for the above.',
  );

  return paragraphs.join('\n\n');
}
