import express from 'express'
import { Router } from 'express'
import dotenv from 'dotenv'
import cors from "cors";
import { createGadget, deleteGadget, getGadgets, selfDestructGadget, updateGadget } from './controllers/gadgets.controllers.js'
import { authenticateUser } from './jwt_middlewares/auth.middlewares.js'
import { loginUser, registerUser } from './controllers/user.controllers.js'

const app = express()
const appRouter = Router()
dotenv.config()

app.use(express.json())
app.use(appRouter)
app.use(cors());


const PORT = process.env.PORT || 5000
app.listen(PORT)

appRouter.route('/gadgets').get(authenticateUser, getGadgets)
appRouter.route('/gadgets').post(authenticateUser, createGadget)
appRouter.route('/gadgets').patch(authenticateUser, updateGadget)
appRouter.route('/gadgets').delete(authenticateUser, deleteGadget)
appRouter.route('/gadgets/:id/self-destruct').post(authenticateUser, selfDestructGadget)
appRouter.route('/register').post(registerUser)
appRouter.route('/login').post(loginUser)
