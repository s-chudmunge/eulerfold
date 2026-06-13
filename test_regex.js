const text = "The formula is \\(A(\\mathbf{x})\\)";
console.log("Original:", text);
console.log("Regex replaced:", text.replace(/\\\(/g, '$').replace(/\\\)/g, '$'));
