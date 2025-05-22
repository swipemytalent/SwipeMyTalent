import { loginHandler } from './handlers/login.js';
import { registerHandler } from './handlers/register.js';

import cors from 'cors';
import dotenv from 'dotenv';
import express, {type Express} from 'express';

dotenv.config();

const app: Express = express();
const port: number = 5000;

app.use(cors());
app.use(express.json());

app.post("/register", registerHandler);
app.post("/login", loginHandler);

app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
});
