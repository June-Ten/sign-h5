import fs from 'fs';

const filePath = './dist/seal.js';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // 删除以 "import require$$3 from"canvas";" 开头的行
  const modifiedContent = data.replace(/^import require\$\$3 from"canvas";\s*\n?/, '');

  // 写回文件
  fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('First line removed successfully.');
    }
  });
});
