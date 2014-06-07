module AST {
    // The helper class for drawing the legend
    export class Draw {
        static drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fillColor) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        }
        static drawText(ctx: CanvasRenderingContext2D, x: number, y: number, font: string, fill, text: string) {
            ctx.font = font;
            ctx.fillStyle = fill;
            ctx.fillText(text, x, y);
        }
        static drawSegment(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, lineWidth: number, strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}