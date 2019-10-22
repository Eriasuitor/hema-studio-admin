import * as moment from 'moment'

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

const humanReadableGenderMap = Object.freeze({
	male: '男',
	female: '女'
})

export function resolveGender(gender) {
	return humanReadableGenderMap[gender] || '未知'
}

const enrollmentStatus = Object.freeze({
	created: '待支付',
	paid: '待确认',
	confirmed: '已确认',
	expired: '已过期'
})
export function resolveEnrollmentStatus(status) {
	return enrollmentStatus[status] || '未知'
}

export function formatDate(date) {
	return moment(date).format('YYYY-MM-DD HH:mm')
}