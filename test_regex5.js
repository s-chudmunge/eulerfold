const str = "\\(a_{ii}\\)"; // literal backslash, literal parenthesis
console.log(str.replace(/\\\\+\(/g, '$').replace(/\\\\+\)/g, '$'));
