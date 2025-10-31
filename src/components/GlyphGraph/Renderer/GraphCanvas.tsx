export function initCanvas(canvasElement: HTMLCanvasElement, width: number, height: number) {
  canvasElement.width = width;
  canvasElement.height = height;
  const ctx = canvasElement.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context');

  return { canvas: canvasElement, ctx };
}
