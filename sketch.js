// Configuration variables
const iterations = 10;
const stepSize = 10;
const angle = 45;
const axiom = "FG";

// State variables
let x, y, direction;
let stack = [];
let lastProcessedIndex = 0;
let currentIteration = 0;
let string = axiom;
let rules = {};
let minX, minY, maxX, maxY;
let pointCount = 0;
let showFinalIteration = false; // Toggle between final iteration and all iterations
let toggleTime = 0; // Timer to track when to switch views

// Generates a random rule for "F" or "G"
function getRandomRule() {
  const chars = ["F", "G", "+", "-", "[", "]"];
  let rule = "";
  let openBrackets = 0;
  let plusMinusCount = 0;
  let bracketCount = 0;

  const maxPlusMinus = 2; // Limit for "+" and "-"
  const maxBrackets = 1; // Limit for "[" and "]"

  for (let i = 0, len = Math.floor(Math.random() * 3) + 3; i < len; i++) {
    let char = chars[Math.floor(Math.random() * chars.length)];

    if (char === "[") {
      if (bracketCount < maxBrackets) {
        openBrackets++;
        bracketCount++;
        if (rule.endsWith("[") || rule.endsWith("]")) char = "F";
      } else {
        char = "F";
      }
    } else if (char === "]") {
      if (
        openBrackets > 0 &&
        bracketCount < maxBrackets &&
        !rule.endsWith("[") &&
        !rule.endsWith("]")
      ) {
        openBrackets--;
        bracketCount++;
      } else {
        char = "F";
      }
    } else if (char === "+" || char === "-") {
      if (plusMinusCount < maxPlusMinus) {
        plusMinusCount++;
      } else {
        char = "F";
      }
    }
    rule += char;
  }

  while (openBrackets > 0) {
    rule += "]";
    openBrackets--;
  }

  if (!rule.includes("F") && !rule.includes("G")) rule += "F";
  if (!rule.includes("+") && !rule.includes("-")) rule += "+";

  return rule;
}

// Sets up the canvas and initializes rules
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  x = width / 2;
  y = height / 2;
  direction = 0;

  minX = width;
  minY = height;
  maxX = 0;
  maxY = 0;

  rules = {
    F: "F-G+F",
    G: "F-G",
  };

  console.log("Rules:", rules);
}
let isPaused = false; // State variable to track if the program is paused

// Main draw loop
function draw() {
  frameRate(10);

  if (isPaused) {
    // Check if 5 seconds have passed since the pause started
    if (millis() - toggleTime > 3000) {
      console.log("Resuming after 5-second pause.");
      isPaused = false; // Resume the program
      resetSystem(); // Reset the system
    }
    return; // Skip the rest of the draw loop while paused
  }

  if (currentIteration < iterations) {
    // Expand the string for the current iteration
    string = expand(string, rules);
    currentIteration++;
    console.log(`Iteration ${currentIteration}:`, string);

    // Interpret and draw the current iteration
    interpretString(string.slice(lastProcessedIndex));
    lastProcessedIndex = string.length;
  } else if (currentIteration === iterations) {
    // Final iteration: draw the last iteration and start the 5-second pause
    console.log("Final iteration drawn. Pausing for 5 seconds.");
    isPaused = true; // Set the paused state
    toggleTime = millis(); // Record the current time
  }
}

// Interprets the string as drawing instructions with scaling and centering
function interpretStringWithScaling(substring, offsetX, offsetY, scaleFactor) {
  for (let char of substring) {
    if (char === "F" || char === "G") {
      stroke(255);
      strokeWeight(2);
      point(x * scaleFactor + offsetX, y * scaleFactor + offsetY); // Apply scaling and offsets
      pointCount++;

      x += stepSize * cos(radians(direction));
      y += stepSize * sin(radians(direction));
    } else if (char === "+") {
      direction = (direction + angle) % 360;
    } else if (char === "-") {
      direction = (direction - angle) % 360;
    } else if (char === "[") {
      stack.push({ x, y, direction });
    } else if (char === "]" && stack.length > 0) {
      ({ x, y, direction } = stack.pop());
    }
  }

  console.log("SCALING Total points drawn:", pointCount);
}

// Expands the current string based on the rules
function expand(axiom, rules) {
  return [...axiom].map((char) => rules[char] || char).join("");
}

// Interprets the string as drawing instructions
function interpretString(substring) {
  for (let char of substring) {
    if (char === "F" || char === "G") {
      stroke(255);
      strokeWeight(2);
      point(x, y);
      pointCount++;

      minX = min(minX, x);
      minY = min(minY, y);
      maxX = max(maxX, x);
      maxY = max(maxY, y);

      x += stepSize * cos(radians(direction));
      y += stepSize * sin(radians(direction));
    } else if (char === "+") {
      direction = (direction + angle) % 360;
    } else if (char === "-") {
      direction = (direction - angle) % 360;
    } else if (char === "[") {
      stack.push({ x, y, direction });
    } else if (char === "]" && stack.length > 0) {
      ({ x, y, direction } = stack.pop());
    } else if (char === "L") {
      stroke(random(255), random(255), random(255)); // Random color
      strokeWeight(2);
      line(x, y, x + stepSize, y + stepSize); // Draw a line
    }
  }

  // Bounding box
  noFill();
  stroke(255, 0, 0);
  strokeWeight(1);
  rect(minX, minY, maxX - minX, maxY - minY);

  console.log("NORMAL Total points drawn:", pointCount);
}
function resetSystem() {
  console.log("Resetting system...");
  background(0);
  x = width / 2;
  y = height / 2;
  direction = 0;
  stack = [];
  lastProcessedIndex = 0;
  currentIteration = 0;
  string = axiom;
  minX = width;
  minY = height;
  maxX = 0;
  maxY = 0;
  pointCount = 0;
  showFinalIteration = false;

  // Generate new random rules
  rules = {
    F: getRandomRule(),
    G: getRandomRule(),
  };
  console.log("New Rules:", rules);
}
