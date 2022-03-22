import Unauthorized from "../errors/UnauthorizedError.js";
import * as authService from "../services/authService.js"

export async function login(req, res) {
    const { email, password } = req.body;

    try {
        const token = await authService.login(email, password)
    
        res.send({token});
    } catch (error) {
        if (error instanceof Unauthorized) return res.status(error.status).send(error.message);

        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}