import express from "express";
import { createServer } from "http";
import { dirname , join} from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
import randomColor from "randomcolor";
import { addOperation, undo, redo, currentState, clear } from "./drawing-state.js";

let user={};
const app=express();
const port = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientPath = join(__dirname, "..", "client");
const server=createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(clientPath));


app.get("/",(req,res)=>{
    res.sendFile(join(clientPath, "index.html"));
})





io.on("connection",(socket)=>{
    console.log("user connected");

    const shortName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, colors], 
      length: 1
    });
    const color=randomColor();
    



    user[socket.id]={shortName,color};
    socket.emit("users",user);

    socket.broadcast.emit("user-joined",{
        id:socket.id,
        shortName,
        color
    })


    socket.on("operation",(operation)=>{
        addOperation(operation);
        io.emit("updated",currentState())
    })

    socket.on("undo",()=>{
        undo();
        io.emit("updated",currentState());
    })

    socket.on("redo",()=>{
        redo();
        io.emit("updated",currentState());
    })


    socket.on("draw",(data)=>{
        socket.broadcast.emit("draw",data);
    })
    


    


    socket.on("cursor",(data)=>{
        socket.broadcast.emit("cursor",{
            id: socket.id,
            x:data.x,
            y:data.y
            
        })

    })

    socket.on("disconnect",()=>{
        console.log("User disconnected");
        delete user[socket.id];
        socket.broadcast.emit("user left",socket.id);
    })

})


server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})