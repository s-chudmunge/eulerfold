const str = "\\(a\\)";
console.log("String: ", str);
console.log("/\\\\+/ match: ", str.match(/\\\\+/g));
console.log("/\\\\/ match: ", str.match(/\\/g));
console.log("/\\\\\\(/ match: ", str.match(/\\\(/g));
