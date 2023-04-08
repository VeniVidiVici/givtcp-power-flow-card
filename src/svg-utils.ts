export class SVGUtils {
	public static getCurvePath(startX: number, startY: number, endX: number, endY: number, curve: number): string {
		// Calculate the midpoint between the start and end points
		const midX = (startX + endX) / 2;
		const midY = (startY + endY) / 2;

		// Calculate the distance between the start and end points
		const distX = endX - startX;
		const distY = endY - startY;
		const dist = Math.sqrt(distX * distX + distY * distY);

		// Calculate the angle between the start and end points
		const angle = Math.atan2(distY, distX);

		// Calculate the coordinates of the curve point
		let curveX = midX;
		let curveY = midY;

		if (curve !== 0) {
			// Calculate the distance to the curve point based on the curve angle
			const curveDist = Math.abs(dist / (2 * Math.sin((curve * Math.PI) / 180)));

			// Calculate the direction of the curve based on the sign of the curve angle
			const curveDir = curve > 0 ? -1 : 1;

			// Calculate the angle of the perpendicular line to the line between the start and end points
			const perpAngle = angle + (curveDir * Math.PI) / 2;

			// Calculate the coordinates of the curve point
			curveX = midX + curveDist * Math.cos(perpAngle);
			curveY = midY + curveDist * Math.sin(perpAngle);
		}

		// Construct the SVG path string
		const path = `M ${startX},${startY} Q ${curveX},${curveY} ${endX},${endY}`;

		return path;
	}
	public static getRoundedBox(
		width: number,
		height: number,
		cornerRadius: number,
		offset?: { x: number; y: number }
	): string {
		const d = Math.min(width, height);
		const r = Math.min(cornerRadius, d / 2);
		if (!offset) offset = { x: 0, y: 0 };
		const topLeft = `M${offset.x},${r + offset.y}` + `a${r},${r} 0 0 1 ${r},${-r}` + `h${width - 2 * r}`;
		const topRight = `a${r},${r} 0 0 1 ${r},${r}` + `v${height - 2 * r}`;
		const bottomRight = `a${r},${r} 0 0 1 ${-r},${r}` + `h${-width + 2 * r}`;
		const bottomLeft = `a${r},${r} 0 0 1 ${-r},${-r}` + `v${-height + 2 * r}`;
		const path = `${topLeft}${topRight}${bottomRight}${bottomLeft}z`;

		return path;
	}
	public static getRoundedCornerPath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		cornerRadius: number,
		direction: number
	): string {
		let path = `M ${startX} ${startY} `; // Start the path at the starting coordinates
		if (direction == 1) {
			path += `H ${endX - cornerRadius} `;
			path += `q ${cornerRadius} 0 ${cornerRadius} -${cornerRadius} `;
			path += `V ${endY} `;
		} else if (direction == 2) {
			path += `H ${endX + cornerRadius} `;
			path += `q -${cornerRadius} 0 -${cornerRadius} ${cornerRadius} `;
			path += `V ${endY} `;
		} else if (direction == 3) {
			path += `V ${endY + cornerRadius} `;
			path += `q 0 -${cornerRadius} -${cornerRadius} -${cornerRadius} `;
			path += `H ${endX} `;
		} else {
			path += `V ${endY - cornerRadius} `;
			path += `q 0 ${cornerRadius} ${cornerRadius} ${cornerRadius} `;
			path += `H ${endX} `;
		}

		return path;
	}
	public static getLShape(startX: number, startY: number, endX: number, endY: number): string {
		let path = `M ${startX} ${startY} `; // Start the path at the starting coordinates

		if (startX !== endX) {
			// Draw horizontal lines if necessary
			path += `H ${endX} `;
		}

		if (startY !== endY) {
			// Draw vertical lines if necessary
			path += `V ${endY} `;
		}

		return path;
	}
	public static getShoulderSVGPath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		cornerRadius: number
	): string {
		let path = `M ${startX} ${startY} `; // Start the path at the starting coordinates

		if (startX !== endX) {
			// Draw horizontal lines if necessary
			const xMidPoint = (startX + endX) / 2;
			path += `H ${xMidPoint - cornerRadius} `;
			path += `Q ${xMidPoint} ${startY} ${xMidPoint} ${startY + cornerRadius} `;
			path += `V ${endY - cornerRadius} `;
			path += `Q ${xMidPoint} ${endY} ${xMidPoint + cornerRadius} ${endY} `;
			path += `H ${endX} `;
		}

		if (startY !== endY) {
			// Draw vertical lines if necessary
			const yMidPoint = (startY + endY) / 2;
			if (startX === endX) {
				path += `V ${yMidPoint - cornerRadius} `;
				path += `Q ${startX} ${yMidPoint} ${startX + cornerRadius} ${yMidPoint} `;
			} else {
				path += `V ${yMidPoint} `;
			}
			path += `H ${endX} `;
		}

		return path;
	}
	public static getCirclePath(
		percentage: number,
		offsetPercentage = 0,
		radius = 50,
		center = { x: 50, y: 50 }
	): string {
		const offset = (offsetPercentage / 100) * 360; // the offset in degrees based on the offset percentage
		const startAngle = -90 + offset; // the starting angle of the circle (12 o'clock position) with offset
		const endAngle = percentage === 100 ? startAngle + 360 : startAngle + (percentage / 100) * 360; // the ending angle based on the percentage, or a full circle if percentage is 100

		// convert degrees to radians
		const startRadians = (startAngle * Math.PI) / 180;
		const endRadians = (endAngle * Math.PI) / 180;

		// calculate the start and end points of the arc
		const startPoint = {
			x: center.x + radius * Math.cos(startRadians),
			y: center.y + radius * Math.sin(startRadians),
		};

		const endPoint = {
			x: percentage === 100 ? 49.99 : center.x + radius * Math.cos(endRadians),
			y: center.y + radius * Math.sin(endRadians),
		};

		// calculate the angle of the arc
		const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

		// build the path string
		return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
	}
}
