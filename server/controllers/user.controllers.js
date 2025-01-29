import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/db.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: "User ID and password are required" });
    }

    try {
        const existingUser = await db.user.findUnique({ where: { userId } });

        if (existingUser) {
            return res.status(400).json({ message: "User ID already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: { userId, password: hashedPassword },
        });

        return res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, userId: newUser.userId } });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: "User ID and password are required" });
    }

    try {
        const user = await db.user.findUnique({ where: { userId } });

        if (!user) {
            return res.status(401).json({ message: "Invalid User ID" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid User ID or password" });
        }

        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
