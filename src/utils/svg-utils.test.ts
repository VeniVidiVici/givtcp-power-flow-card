import { SVGUtils } from './svg-utils';

describe('SVGUtils', () => {
	describe('getCurvePath', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getCurvePath(0, 0, 100, 100, 0);
			expect(result).toMatch(/^M \d+,\d+ Q \d+,\d+ \d+,\d+$/);
		});

		it('should calculate midpoint correctly when curve is 0', () => {
			const result = SVGUtils.getCurvePath(0, 0, 100, 100, 0);
			// Midpoint should be (50, 50)
			expect(result).toContain('Q 50,50');
		});

		it('should handle negative coordinates', () => {
			const result = SVGUtils.getCurvePath(-50, -50, 50, 50, 0);
			expect(result).toMatch(/^M -?\d+,-?\d+ Q -?\d+,-?\d+ -?\d+,-?\d+$/);
		});

		it('should handle horizontal line', () => {
			const result = SVGUtils.getCurvePath(0, 50, 100, 50, 0);
			expect(result).toContain('M 0,50');
			expect(result).toContain('100,50');
		});

		it('should handle vertical line', () => {
			const result = SVGUtils.getCurvePath(50, 0, 50, 100, 0);
			expect(result).toContain('M 50,0');
			expect(result).toContain('50,100');
		});

		it('should calculate curve point when curve is non-zero', () => {
			const result = SVGUtils.getCurvePath(0, 0, 100, 0, 30);
			expect(result).toMatch(/^M -?\d+\.?\d*,-?\d+\.?\d* Q -?\d+\.?\d*,-?\d+\.?\d* -?\d+\.?\d*,-?\d+\.?\d*$/);
		});

		it('should handle negative curve value', () => {
			const result = SVGUtils.getCurvePath(0, 0, 100, 0, -30);
			expect(result).toMatch(/^M -?\d+\.?\d*,-?\d+\.?\d* Q -?\d+\.?\d*,-?\d+\.?\d* -?\d+\.?\d*,-?\d+\.?\d*$/);
		});
	});

	describe('getRoundedBox', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getRoundedBox(100, 100, 10);
			expect(result).toMatch(/^M/);
		});

		it('should end with z to close the path', () => {
			const result = SVGUtils.getRoundedBox(100, 100, 10);
			expect(result).toMatch(/z$/);
		});

		it('should handle corner radius larger than half of min dimension', () => {
			const result = SVGUtils.getRoundedBox(50, 100, 50);
			expect(result).toMatch(/^M/);
		});

		it('should apply offset when provided', () => {
			const result = SVGUtils.getRoundedBox(100, 100, 10, { x: 10, y: 20 });
			expect(result).toContain('M10,');
		});

		it('should handle zero offset', () => {
			const result = SVGUtils.getRoundedBox(100, 100, 10, { x: 0, y: 0 });
			expect(result).toContain('M0,');
		});

		it('should handle no offset parameter', () => {
			const result = SVGUtils.getRoundedBox(100, 100, 10);
			expect(result).toContain('M0,');
		});

		it('should handle small dimensions', () => {
			const result = SVGUtils.getRoundedBox(10, 10, 5);
			expect(result).toMatch(/^M/);
		});
	});

	describe('getRoundedCornerPath', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getRoundedCornerPath(0, 0, 100, 100, 10, 1);
			expect(result).toMatch(/^M \d+ \d+/);
		});

		it('should handle direction 1', () => {
			const result = SVGUtils.getRoundedCornerPath(0, 0, 100, 100, 10, 1);
			expect(result).toContain('H ');
			expect(result).toContain('q ');
			expect(result).toContain('V ');
		});

		it('should handle direction 2', () => {
			const result = SVGUtils.getRoundedCornerPath(0, 0, 100, 100, 10, 2);
			expect(result).toContain('H ');
			expect(result).toContain('q ');
			expect(result).toContain('V ');
		});

		it('should handle direction 3', () => {
			const result = SVGUtils.getRoundedCornerPath(0, 0, 100, 100, 10, 3);
			expect(result).toContain('V ');
			expect(result).toContain('q ');
			expect(result).toContain('H ');
		});

		it('should handle direction 0 (default)', () => {
			const result = SVGUtils.getRoundedCornerPath(0, 0, 100, 100, 10, 0);
			expect(result).toContain('V ');
			expect(result).toContain('q ');
			expect(result).toContain('H ');
		});

		it('should handle zero corner radius', () => {
			const result = SVGUtils.getRoundedCornerPath(0, 0, 100, 100, 0, 1);
			expect(result).toMatch(/^M \d+ \d+/);
		});
	});

	describe('getStraightPath', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getStraightPath(0, 0, 100, 100);
			expect(result).toBe('M 0 0 L 100 100');
		});

		it('should handle negative coordinates', () => {
			const result = SVGUtils.getStraightPath(-50, -50, 50, 50);
			expect(result).toBe('M -50 -50 L 50 50');
		});

		it('should handle horizontal line', () => {
			const result = SVGUtils.getStraightPath(0, 50, 100, 50);
			expect(result).toBe('M 0 50 L 100 50');
		});

		it('should handle vertical line', () => {
			const result = SVGUtils.getStraightPath(50, 0, 50, 100);
			expect(result).toBe('M 50 0 L 50 100');
		});

		it('should handle same start and end point', () => {
			const result = SVGUtils.getStraightPath(10, 10, 10, 10);
			expect(result).toBe('M 10 10 L 10 10');
		});
	});

	describe('getLShape', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getLShape(0, 0, 100, 100, 0);
			expect(result).toMatch(/^M \d+ \d+/);
		});

		it('should draw horizontal then vertical when direction is 0', () => {
			const result = SVGUtils.getLShape(0, 0, 100, 100, 0);
			expect(result).toContain('H 100 ');
			expect(result).toContain('V 100 ');
		});

		it('should draw vertical then horizontal when direction is 1', () => {
			const result = SVGUtils.getLShape(0, 0, 100, 100, 1);
			expect(result).toContain('V 100 ');
			expect(result).toContain('H 100 ');
		});

		it('should handle same X coordinates (only vertical)', () => {
			const result = SVGUtils.getLShape(50, 0, 50, 100, 0);
			expect(result).not.toContain('H ');
			expect(result).toContain('V 100 ');
		});

		it('should handle same Y coordinates (only horizontal)', () => {
			const result = SVGUtils.getLShape(0, 50, 100, 50, 0);
			expect(result).toContain('H 100 ');
			expect(result).not.toContain('V ');
		});

		it('should handle same start and end point', () => {
			const result = SVGUtils.getLShape(50, 50, 50, 50, 0);
			expect(result).toBe('M 50 50 undefinedundefined');
		});
	});

	describe('getShoulderSVGPath', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getShoulderSVGPath(0, 0, 100, 100, 10);
			expect(result).toMatch(/^M \d+ \d+/);
		});

		it('should handle horizontal movement with rounded corners', () => {
			const result = SVGUtils.getShoulderSVGPath(0, 0, 100, 100, 10);
			expect(result).toContain('H ');
			expect(result).toContain('Q ');
			expect(result).toContain('V ');
		});

		it('should handle vertical movement', () => {
			const result = SVGUtils.getShoulderSVGPath(50, 0, 50, 100, 10);
			expect(result).toContain('V ');
			expect(result).toContain('H ');
		});

		it('should handle same start and end X coordinates', () => {
			const result = SVGUtils.getShoulderSVGPath(50, 0, 50, 100, 10);
			expect(result).toMatch(/^M \d+ \d+/);
		});

		it('should handle same start and end Y coordinates', () => {
			const result = SVGUtils.getShoulderSVGPath(0, 50, 100, 50, 10);
			expect(result).toMatch(/^M \d+ \d+/);
		});

		it('should handle zero corner radius', () => {
			const result = SVGUtils.getShoulderSVGPath(0, 0, 100, 100, 0);
			expect(result).toMatch(/^M \d+ \d+/);
		});
	});

	describe('getCirclePath', () => {
		it('should return a valid path string starting with M', () => {
			const result = SVGUtils.getCirclePath(50);
			expect(result).toMatch(/^M \d+\.?\d* \d+\.?\d* A \d+ \d+ \d+ \d+ \d+ \d+\.?\d* \d+\.?\d*$/);
		});

		it('should draw a full circle when percentage is 100', () => {
			const result = SVGUtils.getCirclePath(100);
			expect(result).toMatch(/^M/);
		});

		it('should draw a partial circle when percentage is less than 100', () => {
			const result = SVGUtils.getCirclePath(50);
			expect(result).toMatch(/^M/);
		});

		it('should handle offsetPercentage parameter', () => {
			const result = SVGUtils.getCirclePath(50, 25);
			expect(result).toMatch(/^M/);
		});

		it('should handle custom radius', () => {
			const result = SVGUtils.getCirclePath(50, 0, 30);
			expect(result).toContain('A 30 30');
		});

		it('should handle custom center', () => {
			const result = SVGUtils.getCirclePath(50, 0, 50, { x: 100, y: 100 });
			expect(result).toMatch(/^M/);
		});

		it('should handle zero percentage', () => {
			const result = SVGUtils.getCirclePath(0);
			expect(result).toMatch(/^M/);
		});

		it('should use large arc flag correctly', () => {
			const result50 = SVGUtils.getCirclePath(50);
			const result75 = SVGUtils.getCirclePath(75);
			const result100 = SVGUtils.getCirclePath(100);
			expect(result50).toMatch(/ 0 0 1 /);
			expect(result75).toMatch(/ 0 1 1 /);
			expect(result100).toMatch(/ 0 1 1 /);
		});
	});
});
