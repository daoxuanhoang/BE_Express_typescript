import parsePhoneNumber from 'libphonenumber-js'

const validateInputString = (text: string) => {
    let value = `${text}`.trim().toLowerCase()
    let type: any = null
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/g.test(value)) {
        type = 'EMAIL'
    } else {
        const phoneNumber = parsePhoneNumber(value, 'VN')
        if (phoneNumber && phoneNumber.isValid()) {
            value = `${phoneNumber.number}`
            type = 'PHONE'
        }
    }
    return { value, type }
}

export { validateInputString }
