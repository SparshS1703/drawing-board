const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const cursorCanvas=document.getElementById("cursor");
const cursorCtx=cursorCanvas.getContext("2d");
window.ctx=ctx;
window.canvas=canvas;
let cursor={};
let user={};
let currentColor="#000000";
let currentTool="brush";
let currentWidth=1;
let isDrawing=false;
let pointX=0;
let pointY=0;
let currentStroke=[];
window.user=user;

//---------------- setting canvas size ----------------------
function resize(){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight*0.9;
    cursorCanvas.width=window.innerWidth;
    cursorCanvas.height=window.innerHeight*0.9;
}
resize();
window.addEventListener("resize",resize);


//------------------- drawing strokes -----------------------
function draw(data){
if (data.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20; 
    }
    else
    {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle=data.color;
        ctx.lineWidth=data.width;
    }
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.beginPath();
    
    ctx.moveTo(data.fromX,data.fromY);
    ctx.lineTo(data.toX,data.toY);
    ctx.stroke();
    
}

//----------adding event listeners-----------------------------

canvas.addEventListener("mousedown",(e)=>{
    isDrawing=true;
    pointX=e.offsetX;
    pointY=e.offsetY;
    currentStroke=[];
    currentStroke.push({x:pointX , y:pointY});
})

canvas.addEventListener("mousemove",(e)=>{

    socket.emit("cursor",{
        x: e.offsetX,
        y: e.offsetY
    })


     if(!isDrawing)
        return;
    const data={
    fromX:pointX,
    fromY:pointY,
    toX:e.offsetX,
    toY:e.offsetY,
    tool: currentTool,
    width:currentWidth,
    color:currentColor
}
    draw(data)

    socket.emit("draw",data);

    
    currentStroke.push({x:e.offsetX , y: e.offsetY});
    pointX=e.offsetX;
    pointY=e.offsetY;
})

canvas.addEventListener("mouseup",(e)=>{
    isDrawing=false;
    ctx.globalCompositeOperation = "source-over"; 

    const operation={
        id: crypto.randomUUID(),
        tool:currentTool,
        width: currentWidth,
        color: currentColor,
        points: currentStroke
    }
    socket.emit("operation",operation);
    
})

// ------------------using clear button-------------------------------------

let clearButton=document.getElementById("Clear");
clearButton.addEventListener("click",()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
})

// -------------------------selecting brush -----------------------------
let brush=document.getElementById("Brush");
brush.addEventListener("click",()=>{
    currentTool = "brush";
    currentWidth=4;
    ctx.lineCap="round";
    ctx.lineJoin="round";
})

//---------------- selecting pen ----------------------------- 

let pen=document.getElementById("Pen");
pen.addEventListener("click",()=>{
    ctx.lineWidth=1;
    ctx.lineCap="butt";
    ctx.lineJoin="miter"
})

// -----------------------------selecting color-----------------------------

let colorPicker=document.getElementById("colorPicker");
colorPicker.addEventListener("input",(e)=>{
    currentTool="brush";
    currentColor=e.target.value;
    ctx.globalCompositeOperation = "source-over";
})

//----------------------------- eraser-----------------------------

let eraser=document.getElementById("Eraser");
eraser.addEventListener("click",()=>{
    currentTool = "eraser";
})

// -----------------------------selecting width-----------------------------
let width=document.getElementById("range");
width.addEventListener("input",(e)=>{
    currentWidth=e.target.value;
    ctx.globalCompositeOperation = "source-over";
})

window.draw=draw;
window.cursor=cursor;


//  ----------------------------- drawing cursor indicator for each user-----------------------------

function drawCursor(){
    cursorCtx.clearRect(0,0,cursorCanvas.width,cursorCanvas.height);
    Object.entries(cursor).forEach(([id , pos]) => {
        const u=user[id];
        if(!u)return;
        cursorCtx.beginPath();
        cursorCtx.arc(pos.x,pos.y,4,0,Math.PI*2);
        cursorCtx.fillStyle=u.color;
        cursorCtx.fill();

        cursorCtx.font="12px sans-serif";
        cursorCtx.fillStyle=u.color;
        cursorCtx.fillText(u.shortName,pos.x+8,pos.y-8);
    });
    
}


function renderCursor(){
    drawCursor();
    requestAnimationFrame(renderCursor);
}

renderCursor();

function drawOperation(op){
    if (!op || !op.points || op.points.length < 2) return;
    for(let i=1;i<op.points.length;i++)
    {
        draw({
            fromX:op.points[i-1].x,
            fromY:op.points[i-1].y,
            toX:op.points[i].x,
            toY:op.points[i].y,
            tool:op.tool,
            width:op.width,
            color:op.color
        })
    }
}

window.drawOperation=drawOperation;

