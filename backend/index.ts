import express, {type Express} from 'express';
import { registerHandler } from './handlers/register.js';
import { loginHandler } from './handlers/login.js';

const app: Express = express();
const port: number = 5000;

app.use(express.json());

app.post("/register", registerHandler);
app.post("/login", loginHandler);

app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
});
