

export function colorString(color: number) {
	const r = Math.floor(color / (256 * 256));
	const g = Math.floor(color / 256) % 256;
	const b = color % 256;
	return "#" + twoDigit(r, 16) + twoDigit(g, 16) + twoDigit(b, 16);
}

function twoDigit(a: number, radix: number) {
	if (a < radix) return "0" + a.toString(radix);
	else return a.toString(radix);
}

// From https://stackoverflow.com/questions/31302054/how-to-find-the-least-common-multiple-of-a-range-of-numbers
export function gcd(a: number, b: number): number {
	return !b ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
	return (a * b) / gcd(a, b);
}
