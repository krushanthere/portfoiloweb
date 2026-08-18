import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../public/data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Process Hands from Reference Image (Creation of Adam)
console.log("Extracting halftone dots from Creation of Adam reference image...");
try {
  execSync("python3 scripts/process-adam-hands.py", { stdio: "inherit" });
} catch (e) {
  console.error("Failed to run python hand processor:", e);
}

// 2. Generate Quote Sphere
const QUOTES_TEXT = [
  "WE CAN ONLY SEE A SHORT DISTANCE AHEAD BUT WE CAN SEE PLENTY THERE THAT NEEDS TO BE DONE — ALAN TURING",
  "INFORMATION IS THE RESOLUTION OF UNCERTAINTY — CLAUDE SHANNON",
  "YOU BELIEVE THAT YOU ARE THINKING BUT REALLY YOU ARE JUST COMPUTING PROBABILITIES — JOHN VON NEUMANN",
  "INTELLIGENCE IS THE COMPUTATIONAL PART OF THE ABILITY TO ACHIEVE GOALS IN THE WORLD — JOHN MCCARTHY",
  "THE ANALYTICAL ENGINE WEAVES ALGEBRAICAL PATTERNS JUST AS THE JACQUARD LOOM WEAVES FLOWERS — ADA LOVELACE",
  "SIMPLICITY IS PREREQUISITE FOR RELIABILITY — EDSGER W DIJKSTRA",
  "ANY SUFFICIENTLY ADVANCED TECHNOLOGY IS INDISTINGUISHABLE FROM MAGIC — ARTHUR C CLARKE",
  "ARTIFICIAL INTELLIGENCE IS THE SCIENCE OF MAKING MACHINES DO THINGS THAT REQUIRE INTELLIGENCE — MARVIN MINSKY"
].join("   ✦   ");

function generateFibonacciSphere(totalPoints = 2800, radius = 0.68) {
  const points = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  const quoteChars = QUOTES_TEXT.split("");
  const charCount = quoteChars.length;

  for (let i = 0; i < totalPoints; i++) {
    const y = 1 - (i / (totalPoints - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = (2 * Math.PI * i) / phi;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const nx = x;
    const ny = y;
    const nz = z;

    const bx = x * radius;
    const by = y * radius;
    const bz = z * radius;

    const char = quoteChars[i % charCount];
    const charCode = char.charCodeAt(0);

    const speed = 1.2 + Math.sin(i * 12.9898) * 0.8 + (Math.cos(i * 78.233) * 0.4);
    const rotSpeedX = (Math.sin(i * 43.12) - 0.5) * 4.0;
    const rotSpeedY = (Math.cos(i * 19.87) - 0.5) * 4.0;
    const rotSpeedZ = (Math.sin(i * 92.45) - 0.5) * 4.0;

    const curlX = Math.sin(i * 0.17) * 0.6;
    const curlY = Math.cos(i * 0.23) * 0.6;
    const curlZ = Math.sin(i * 0.31) * 0.6;

    points.push({
      id: i,
      char,
      charCode,
      bx: parseFloat(bx.toFixed(4)),
      by: parseFloat(by.toFixed(4)),
      bz: parseFloat(bz.toFixed(4)),
      nx: parseFloat(nx.toFixed(4)),
      ny: parseFloat(ny.toFixed(4)),
      nz: parseFloat(nz.toFixed(4)),
      speed: parseFloat(speed.toFixed(3)),
      rotSpeed: [
        parseFloat(rotSpeedX.toFixed(2)),
        parseFloat(rotSpeedY.toFixed(2)),
        parseFloat(rotSpeedZ.toFixed(2))
      ],
      curl: [
        parseFloat(curlX.toFixed(3)),
        parseFloat(curlY.toFixed(3)),
        parseFloat(curlZ.toFixed(3))
      ]
    });
  }

  return points;
}

console.log("Generating Fibonacci quote sphere points...");
const spherePoints = generateFibonacciSphere(2800, 0.68);
fs.writeFileSync(path.join(DATA_DIR, "sphere-points.json"), JSON.stringify(spherePoints));
console.log(`✓ Generated ${spherePoints.length} characters on quote sphere.`);
console.log("Pipeline completed successfully!");
