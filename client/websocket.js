const socket=io();

window.socket=socket;

socket.on("draw",(data)=>{
    draw(data);
})

socket.on("cursor",(data)=>{
    cursor[data.id]={
         x:data.x,
         y:data.y
    }

})

socket.on("user-joined",({id,shortName,color})=>{
    user[id]={shortName,color}
})

socket.on("users",(serverUsers)=>{
    user=serverUsers;
})

socket.on("updated",(operation)=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    operation.forEach(op=>{
        drawOperation(op);
    })
})

socket.on("user left",(socketId)=>{
    delete cursor[socketId];
    delete user[socketId];
})

document.getElementById("undo").addEventListener("click", () => {
    socket.emit("undo");
});
document.getElementById("redo").addEventListener("click", () => {
    socket.emit("redo");
});


// const canvas=document.getElementById("canvas");
// const ctx=canvas.getContext("2d");
// let isDrawing=false;
// let pointX=0;
// let pointY=0;
// let currentColor="#000000";
// let currentTool="brush";
// let currentWidth=1;


// function draw(data){
// if (data.tool === "eraser") {
//       ctx.globalCompositeOperation = "destination-out";
//       ctx.lineWidth = 20; 
//     }
//     else
//     {
//         ctx.globalCompositeOperation = "source-over";
//         ctx.strokeStyle=data.color;
//         ctx.lineWidth=data.width;
//     }
//     ctx.lineCap="round";
//     ctx.lineJoin="round";
//     ctx.beginPath();
    
//     ctx.moveTo(data.fromX,data.fromY);
//     ctx.lineTo(data.toX,data.toY);
//     ctx.stroke();
// }



// canvas.addEventListener("mousedown",(e)=>{
//     isDrawing=true;
//     pointX=e.offsetX;
//     pointY=e.offsetY;
// })

// canvas.addEventListener("mousemove",(e)=>{
//     if(!isDrawing)
//         return;
//     const data={
//     fromX:pointX,
//     fromY:pointY,
//     toX:e.offsetX,
//     toY:e.offsetY,
//     tool: currentTool,
//     width:currentWidth,
//     color:currentColor
// }
//     draw(data)
//     socket.emit("draw",data);

//     pointX=e.offsetX;
//     pointY=e.offsetY;
// })

// canvas.addEventListener("mouseup",(e)=>{
//     isDrawing=false;
//     ctx.globalCompositeOperation = "source-over";
// })





// let colorPicker=document.getElementById("colorPicker");
// colorPicker.addEventListener("input",(e)=>{
//     currentTool="brush";
//     currentColor=e.target.value;
// })
// let eraser=document.getElementById("Eraser");
// eraser.addEventListener("click",()=>{
//     currentTool = "eraser";
// })
// let width=document.getElementById("range");
// width.addEventListener("input",(e)=>{
//     currentWidth=e.target.value;
    
// })

