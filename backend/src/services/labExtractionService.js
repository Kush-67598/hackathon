const pdfParse = require("pdf-parse");
const ApiError = require("../utils/ApiError");

const MARKER_CONFIG = {
  hemoglobin: { aliases: ["hemoglobin", "haemoglobin", "hb"], min: 3, max: 20 },
  tsh: { aliases: ["tsh"], min: 0.01, max: 100 },
  ferritin: { aliases: ["ferritin"], min: 1, max: 2000 },
  t3: { aliases: ["t3", "free t3"], min: 0.1, max: 1000 },
  t4: { aliases: ["t4", "free t4"], min: 0.1, max: 200 },
  lh: { aliases: ["lh", "luteinizing hormone"], min: 0.1, max: 200 },
  fsh: { aliases: ["fsh", "follicle stimulating hormone"], min: 0.1, max: 200 },
};

function extractNearbyNumbers(line, marker) {
  const matches = [...line.matchAll(/\d+(?:\.\d+)?/g)];
  return matches
    .map((m) => Number(m[0]))
    .filter((n) => Number.isFinite(n) && n >= marker.min && n <= marker.max);
}

function scoreConfidence(candidateCount) {
  if (candidateCount <= 1) return "high";
  if (candidateCount === 2) return "medium";
  return "low";
}

function parseLabValues(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const extracted = {
    hemoglobin: null,
    tsh: null,
    ferritin: null,
    t3: null,
    t4: null,
    lh: null,
    fsh: null,
  };

  const confidence = {};
  const rawTextSnippets = [];
  const warnings = [];

  for (const [field, config] of Object.entries(MARKER_CONFIG)) {
    const candidates = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (!config.aliases.some((alias) => lowerLine.includes(alias))) {
        continue;
      }

      const nums = extractNearbyNumbers(line, config);
      for (const value of nums) {
        candidates.push({ value, line });
      }
    }

    if (candidates.length > 0) {
      extracted[field] = candidates[0].value;
      confidence[field] = scoreConfidence(candidates.length);
      rawTextSnippets.push(...candidates.slice(0, 2).map((c) => `${field}: ${c.line}`));
      if (candidates.length > 1) {
        warnings.push(`multiple_matches_for_${field}`);
      }
    } else {
      confidence[field] = "low";
    }
  }

  return {
    extracted,
    confidence,
    raw_text_snippets: rawTextSnippets.slice(0, 10),
    warnings,
  };
}

async function extractLabsFromPdf(fileBuffer) {
  if (!fileBuffer) {
    throw new ApiError(400, "PDF file is required");
  }

  let text = "";
  try {
    const data = await pdfParse(fileBuffer);
    text = data.text || "";
  } catch (err) {
    throw new ApiError(422, "Unreadable PDF. Could not extract text.");
  }

  if (!text.trim()) {
    throw new ApiError(422, "PDF contains no extractable text");
  }

  return parseLabValues(text);
}

module.exports = { extractLabsFromPdf };
