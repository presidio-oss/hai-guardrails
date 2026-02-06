var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// node_modules/string-similarity/src/index.js
var require_src = __commonJS((exports2, module2) => {
  module2.exports = {
    compareTwoStrings,
    findBestMatch
  };
  function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, "");
    second = second.replace(/\s+/g, "");
    if (first === second)
      return 1;
    if (first.length < 2 || second.length < 2)
      return 0;
    let firstBigrams = new Map;
    for (let i = 0;i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
      firstBigrams.set(bigram, count);
    }
    let intersectionSize = 0;
    for (let i = 0;i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }
    return 2 * intersectionSize / (first.length + second.length - 2);
  }
  function findBestMatch(mainString, targetStrings) {
    if (!areArgsValid(mainString, targetStrings))
      throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");
    const ratings = [];
    let bestMatchIndex = 0;
    for (let i = 0;i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = compareTwoStrings(mainString, currentTargetString);
      ratings.push({ target: currentTargetString, rating: currentRating });
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i;
      }
    }
    const bestMatch = ratings[bestMatchIndex];
    return { ratings, bestMatch, bestMatchIndex };
  }
  function areArgsValid(mainString, targetStrings) {
    if (typeof mainString !== "string")
      return false;
    if (!Array.isArray(targetStrings))
      return false;
    if (!targetStrings.length)
      return false;
    if (targetStrings.find(function(s) {
      return typeof s !== "string";
    }))
      return false;
    return true;
  }
});

// src/workers/heuristic.worker.ts
var exports_heuristic_worker = {};
__export(exports_heuristic_worker, {
  default: () => heuristic_worker_default
});
module.exports = __toCommonJS(exports_heuristic_worker);
var import_string_similarity = __toESM(require_src());

// src/utils/util.ts
function normalizeString(str) {
  return str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
}
function safeExecute(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

// src/workers/heuristic.worker.ts
async function heuristic_worker_default({
  input,
  keyword,
  threshold = 0.8
}) {
  const inputTokens = normalizeString(input).split(" ");
  const normalizedKeyword = normalizeString(keyword);
  const keywordTokens = normalizedKeyword.split(" ");
  const n = keywordTokens.length;
  const substringCache = [];
  for (let i = 0;i <= inputTokens.length - n; i++) {
    const tokens = inputTokens.slice(i, i + n);
    substringCache.push({ raw: tokens.join(" "), tokens });
  }
  let highestScore = 0;
  let bestSubstring = "";
  for (const { raw: candidate, tokens: candidateTokens } of substringCache) {
    const similarityScore = import_string_similarity.default.compareTwoStrings(normalizedKeyword, candidate);
    let matchedWordsCount = 0;
    for (let j = 0;j < n; j++) {
      if (candidateTokens[j] === keywordTokens[j])
        matchedWordsCount++;
    }
    const maxMatchedWords = 5;
    const baseScore = matchedWordsCount > 0 ? 0.5 + 0.5 * Math.min(matchedWordsCount / maxMatchedWords, 1) : 0;
    const adjustedScore = baseScore + similarityScore * (1 / (maxMatchedWords * 2));
    if (adjustedScore > highestScore) {
      highestScore = adjustedScore;
      bestSubstring = candidate;
    }
  }
  return {
    score: highestScore,
    additionalFields: {
      bestKeyword: keyword,
      bestSubstring,
      threshold,
      isInjection: highestScore >= threshold
    }
  };
}
