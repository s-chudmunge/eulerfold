import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const text = `The core of SPH is the kernel‑based interpolation.
$$ \\langle A(\\mathbf{x}_i) \\rangle = \\sum_{j\\in\\mathcal{N}(i)} $$
Key properties of the kernel...`;

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeStringify);

processor.process(text).then((file) => {
  console.log(String(file));
});
