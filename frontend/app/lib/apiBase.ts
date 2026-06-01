/*export function getApiBase() {
	if (typeof window !== "undefined") {
		return `http://${window.location.hostname}:3001`;
	}
 
	return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
}*/

export function getApiBase() {
	return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dance-school-dw6q.onrender.com";
}
