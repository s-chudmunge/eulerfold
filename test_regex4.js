const s = "\\(\\mathbf{x}_i\\)"; // A string with \ and (
console.log(s);
console.log(s.replace(/\\\(/g, '$').replace(/\\\)/g, '$'));

const s2 = "\\\\(\\mathbf{x}_i\\\\)"; // A string with \\ and (
console.log(s2);
console.log(s2.replace(/\\\(/g, '$').replace(/\\\)/g, '$'));
