class Stack {
    constructor(size){
        this.size = size;
        this.stack = [];
    }

    pop = () => {
        return this.stack.pop();
    }

    push = (item) => {
        if(this.size=-1){
            return this.stack.push(item)
        }
        else if (this.stack.length > this.length) {
            this.stack.shift();
            return this.stack.push(item);
        }
        else{
            return this.stack.push(item);
        }
    }
}

export default Stack;
