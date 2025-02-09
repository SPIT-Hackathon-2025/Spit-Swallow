import http from "http";
import { Server } from "socket.io";
import app from "../server.js";

const server = http.createServer(app);
const io = new Server(server);

export { server, io };
