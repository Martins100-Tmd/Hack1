import * as Jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const Token = function (name: string, password: string, email: string) {
    const payload = {
        name,
        email,
        password
    };
    return Jwt.sign(payload, process.env.JWT_SECRET ?? "", { expiresIn: 100000 });
}


export const accessToken = function (password: string, email: string) {
    const payload = {
        email,
        password
    };
    return Jwt.sign(payload, process.env.JWT_SECRET ?? "", { expiresIn: 100000 });
}
