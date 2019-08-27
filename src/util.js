export function formatToInteger(min, max) {
	return (event) => {
		let value = parseInt(event.target.value.replace(/\D/g, ''))
		if (isNaN(value)) return null
		min !== undefined && value < min && (value = min)
		max !== undefined && value > max && (value = max)
		console.log(value)
		return value
	}
}