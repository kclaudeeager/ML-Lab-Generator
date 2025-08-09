export const simulationMeta = {
  title: "Enhanced pH Chemistry Lab",
  description: "Interactive simulation showing pH changes with concentration and temperature",
  subject: "chemistry",
  gradeLevel: "9-12",
  estimatedTime: 25,
  variables: [
    {
      name: "concentration",
      type: "slider",
      label: "Acid Concentration (M)",
      min: 0.01,
      max: 1.0,
      default: 0.1,
      unit: "M"
    },
    {
      name: "temperature",
      type: "slider", 
      label: "Temperature (°C)",
      min: 0,
      max: 100,
      default: 25,
      unit: "°C"
    }
  ],
  outputs: [
    {
      name: "pH",
      type: "text",
      label: "pH Value",
      unit: ""
    },
    {
      name: "color",
      type: "visual",
      label: "Solution Color",
      unit: ""
    }
  ],
  safetyConsiderations: [
    "Always wear safety goggles",
    "Handle acids carefully"
  ],
  learningObjectives: [
    "Understand pH calculations",
    "Observe temperature effects on pH",
    "Relate concentration to acidity"
  ]
};

export function initializeSimulation(canvas: HTMLCanvasElement): void {
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.fillStyle = "#f0f8ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("pH Chemistry Simulation", 10, 30);
  ctx.font = "12px Arial";
  ctx.fillText("Adjust variables to see pH changes", 10, 50);
}

export function runSimulation(variables: Record<string, any>): any {
  const concentration = variables.concentration || 0.1;
  const temperature = variables.temperature || 25;
  
  // Temperature coefficient for pH calculation
  const tempFactor = 1 + (temperature - 25) * 0.002;
  const pH = -Math.log10(concentration * tempFactor);
  
  // Determine color based on pH
  let color = "neutral";
  if (pH < 4) color = "red";
  else if (pH < 6) color = "orange"; 
  else if (pH < 8) color = "yellow";
  else if (pH < 10) color = "green";
  else color = "blue";
  
  return { pH: pH.toFixed(2), color, concentration, temperature };
}

export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  const results = runSimulation(variables);
  
  // Clear and redraw
  ctx.fillStyle = "#f0f8ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw solution container
  ctx.fillStyle = getColorHex(results.color);
  ctx.fillRect(50, 60, 100, 120);
  ctx.strokeStyle = "black";
  ctx.strokeRect(50, 60, 100, 120);
  
  // Display values
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(`pH: ${results.pH}`, 180, 80);
  ctx.fillText(`Concentration: ${results.concentration} M`, 180, 100);
  ctx.fillText(`Temperature: ${results.temperature}°C`, 180, 120);
  ctx.fillText(`Color: ${results.color}`, 180, 140);
  
  // pH scale
  drawPHScale(ctx, parseFloat(results.pH));
}

export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  updateSimulation(data, canvas);
}

function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    red: "#ff4444",
    orange: "#ff8844", 
    yellow: "#ffff44",
    green: "#44ff44",
    blue: "#4444ff",
    neutral: "#cccccc"
  };
  return colors[colorName] || colors.neutral;
}

function drawPHScale(ctx: CanvasRenderingContext2D, pH: number): void {
  const scaleX = 200;
  const scaleY = 160;
  const scaleWidth = 140;
  const scaleHeight = 20;
  
  // Draw pH scale background
  const gradient = ctx.createLinearGradient(scaleX, 0, scaleX + scaleWidth, 0);
  gradient.addColorStop(0, "#ff0000");
  gradient.addColorStop(0.5, "#ffff00");
  gradient.addColorStop(1, "#0000ff");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(scaleX, scaleY, scaleWidth, scaleHeight);
  ctx.strokeRect(scaleX, scaleY, scaleWidth, scaleHeight);
  
  // Draw pH indicator
  const indicatorX = scaleX + (pH / 14) * scaleWidth;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(indicatorX, scaleY - 5);
  ctx.lineTo(indicatorX - 5, scaleY - 15);
  ctx.lineTo(indicatorX + 5, scaleY - 15);
  ctx.closePath();
  ctx.fill();
  
  // Draw scale numbers
  ctx.font = "10px Arial";
  for (let i = 0; i <= 14; i += 2) {
    const x = scaleX + (i / 14) * scaleWidth;
    ctx.fillText(i.toString(), x - 5, scaleY + 35);
  }
}
