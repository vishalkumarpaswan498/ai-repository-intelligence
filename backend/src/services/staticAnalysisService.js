const getExtension = (filePath) => {
  const match = filePath.match(/\.[^./\\]+$/);
  return match ? match[0].toLowerCase() : "";
};

const countLines = (content) => {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
};

const countMatches = (content, regex) => {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
};


// JavaScript / TypeScript analysis
const analyzeJavaScriptLikeFile = (content) => {
  return {
    functions: countMatches(
      content,
      /\b(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g
    ),

    imports: countMatches(
      content,
      /\bimport\s+/g
    ),

    exports: countMatches(
      content,
      /\bexport\s+/g
    ),

    asyncFunctions: countMatches(
      content,
      /\basync\s+(?:function|\w+\s*=\s*\([^)]*\))/g
    ),

    classes: countMatches(
      content,
      /\bclass\s+\w+/g
    ),
  };
};


// Python analysis
const analyzePythonFile = (content) => {
  return {
    functions: countMatches(
      content,
      /^\s*def\s+\w+/gm
    ),

    imports: countMatches(
      content,
      /^\s*(?:import|from)\s+/gm
    ),

    classes: countMatches(
      content,
      /^\s*class\s+\w+/gm
    ),
  };
};


// Java / C / C++ / C# analysis
const analyzeJavaLikeFile = (content) => {
  return {
    functions: countMatches(
      content,
      /\b(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+\w+\s*\([^)]*\)\s*\{/g
    ),

    imports: countMatches(
      content,
      /^\s*import\s+/gm
    ),

    classes: countMatches(
      content,
      /\bclass\s+\w+/g
    ),
  };
};


// Analyze one file
export const analyzeFile = (file) => {
  const extension = getExtension(file.path);
  const content = file.content || "";

  const result = {
    path: file.path,
    extension,
    size: file.size || 0,
    lines: countLines(content),

    functions: 0,
    imports: 0,
    exports: 0,
    classes: 0,
    asyncFunctions: 0,
  };


  // JavaScript / TypeScript
  if (
    [".js", ".jsx", ".ts", ".tsx"].includes(extension)
  ) {
    const analysis =
      analyzeJavaScriptLikeFile(content);

    result.functions = analysis.functions;
    result.imports = analysis.imports;
    result.exports = analysis.exports;
    result.asyncFunctions =
      analysis.asyncFunctions;
    result.classes = analysis.classes;
  }


  // Python
  if (extension === ".py") {
    const analysis =
      analyzePythonFile(content);

    result.functions = analysis.functions;
    result.imports = analysis.imports;
    result.classes = analysis.classes;
  }


  // Java / C / C++ / C#
  if (
    [".java", ".c", ".cpp", ".h", ".hpp", ".cs"]
      .includes(extension)
  ) {
    const analysis =
      analyzeJavaLikeFile(content);

    result.functions = analysis.functions;
    result.imports = analysis.imports;
    result.classes = analysis.classes;
  }

  return result;
};


// Analyze complete repository
export const analyzeRepositoryFiles = (files) => {
  const fileResults = files.map(analyzeFile);

  const summary = {
    totalFiles: fileResults.length,
    totalLines: 0,
    totalFunctions: 0,
    totalImports: 0,
    totalExports: 0,
    totalClasses: 0,
    totalSize: 0,
  };


  for (const file of fileResults) {
    summary.totalLines += file.lines;
    summary.totalFunctions += file.functions;
    summary.totalImports += file.imports;
    summary.totalExports += file.exports;
    summary.totalClasses += file.classes;
    summary.totalSize += file.size;
  }


  return {
    summary,
    files: fileResults,
  };
};