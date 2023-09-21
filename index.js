import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import routerAPI from "./api/routes/index.js";
import cors from "cors";
import path from "path";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import "dotenv/config";
import http from 'http'
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const uri = process.env.MONGO_URL;
const port = process.env.PORT;
const server = http.createServer(app)
export const io = new Server(server, {
  cors: { origin: '*' }
});

// Middlewares
app.use(compression());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//Main route and routes
app.get("/", (req, res) => {
  res.send(`<h1>Fake Social app server</h1>`);
});

routerAPI(app);

//DB Connection
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("good"))
  .catch((error) => console.log(error));

server.listen(port, () => {
  console.log(`this is the port ${port}`);
});
