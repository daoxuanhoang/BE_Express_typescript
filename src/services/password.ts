import * as bcrypt from 'bcryptjs'

export class Password {
    static toHash(password: string) {
        bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    }

    static compare(storedPassword: string, suppliedPassword: string) {
        if (!storedPassword) return false
        const isMatch = bcrypt.compareSync(suppliedPassword, storedPassword) as Boolean
        return isMatch
    }
}