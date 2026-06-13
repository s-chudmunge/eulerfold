const strings = [
  "\\(\\mathbf{x}_i\\)", // Single slash (escaped in JS string literal) -> \(\mathbf{x}_i\)
  "\\\\(\\mathbf{x}_i\\\\)", // Double slash -> \\(\mathbf{x}_i\\)
];

strings.forEach(s => {
    console.log("Original: ", JSON.stringify(s));
    console.log("Replaced: ", JSON.stringify(s.replace(/\\\(/g, '$').replace(/\\\)/g, '$')));
});
