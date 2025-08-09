export const simulationMeta = {
  title: "Test pH Simulation",
  subject: "chemistry",
  gradeLevel: "9-12",
  variables: [
    {
      name: "concentration",
      type: "slider",
      min: 0.01,
      max: 1.0,
      step: 0.01
    }
  ]
};

export function initializeSimulation(canvas: HTMLCanvasElement): void {
  canvas.width = 800;
  canvas.height = 600;
}

export function runSimulation(variables: Record<string, any>): any {
  const concentration = variables["concentration"] || 0.1;
  const Ka = 1.8e-5;
  const pH = -Math.log10(Math.sqrt(Ka * concentration));
  const indicatorColor = pH < 7 ? "red" : pH > 7 ? "blue" : "green";
  return { pH, concentration, indicatorColor };
}

export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "18px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`pH: ${variables.pH?.toFixed(2) || 'N/A'}`, 10, 20);
  ctx.fillText(`Concentration: ${variables.concentration || 'N/A'} M`, 10, 40);
  ctx.fillStyle = variables.indicatorColor || "gray";
  ctx.fillRect(10, 60, 30, 30);
}

export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  updateSimulation(data, canvas);
}

export default function mountSimulation(canvas: HTMLCanvasElement, initialVars: Record<string, any>) {
  initializeSimulation(canvas);
  const result = runSimulation(initialVars);
  updateSimulation(result, canvas);
  return result;
}
