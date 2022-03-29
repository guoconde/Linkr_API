import bcrypt from 'bcrypt';
import Unauthorized from '../errors/UnauthorizedError.js';
import * as userRepository from "../repositories/userRepository.js"
import * as authRepository from "../repositories/authRepository.js"
import jwt from "jsonwebtoken"

export async function login(email, password){
    const user = await userRepository.find("email", email)
    if (!user) throw new Unauthorized("Email ou senha inválidos")
    
    if (bcrypt.compareSync(password, user.password)) {
        const jwtConfiguration = { expiresIn: '1h'}
        const jwtData = { userId: user.id }

        const session = await authRepository.find(user.id)
        if(session) return {token: session.token, photo: user.photo, userId: user.id, userName: user.name }

        const token = jwt.sign(jwtData, process.env.JWT_SECRET, jwtConfiguration);
        
        const result = await authRepository.insert(token, user.id)
        if (!result) throw new Error();

        return {token, photo: user.photo, userId: user.id, userName: user.name};
    }

    throw new Unauthorized("The email or password provided is invalid, please try again!")
}
