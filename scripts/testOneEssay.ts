import referenceStats from "../src/data/referenceStats.json";
import { analyzeEssay } from "../src/services/essayAnalysisService";

console.log("=== CHECKING referenceStats.json LOAD ===");
console.log(`Dataset size: ${referenceStats.datasetSize}`);
console.log(`AI count: ${referenceStats.aiCount}, Human count: ${referenceStats.humanCount}`);
console.log("Loaded signal statistics keys:", Object.keys(referenceStats.signals));

const testEssay = `Car-free cities have become a subject of increasing interest and debate in recent years, as urban areas around the world grapple with the challenges of congestion, pollution, and limited resources. The concept of a car-free city involves creating urban environments where private automobiles are either significantly restricted or completely banned, with a focus on alternative transportation methods and sustainable urban planning.`;

console.log("\n=== RUNNING ONE ESSAY THROUGH SCORER ===");
const result = analyzeEssay(testEssay);
console.log("Overall Score:", result.score.overallScore);
console.log("Confidence:", result.score.confidence);
console.log("Breakdown:", JSON.stringify(result.score.breakdown, null, 2));
console.log("Flags:", result.score.flags);
