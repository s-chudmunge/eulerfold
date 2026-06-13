console.log("\\(".match(/\\\\+\(/g)); // null
console.log("\\(".match(/\\+\(/g));   // [ '\\(' ]
