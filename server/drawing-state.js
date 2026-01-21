let operations=[];
let redoOperation=[];


export function addOperation(data){
    operations.push(data);
    redoOperation=[];
}
export function undo(){
    if(operations.length===0)
        return ;
    const opp=operations.pop();
    redoOperation.push(opp);
    return ;
}

export function redo(){
    if(redoOperation.length===0)
        return;
    const opp=redoOperation.pop();
    operations.push(opp);
    return;
}

export function currentState(){
    return operations;
}

export function clear(){
    operations=[];
    redoOperation=[];

}