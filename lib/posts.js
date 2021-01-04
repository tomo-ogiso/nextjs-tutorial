import fs from "fs"; // もともとnode.jsで使えるパッケージ
import path from "path"; // もともとnode.jsで使えるパッケージ
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";

// 今いるディレクトリから、postsフォルダまでのディレクトリを取得
const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // Get file names under /posts
  // 引数のディレクトリからファイル名を配列で取得(node.js)
  const fileNames = fs.readdirSync(postsDirectory);
  // ファイルを取得
  const allPostsData = fileNames.map((fileName) => {
    // ファイル名から拡張子を削除
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");
    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);
    // ファイル名(id)と中身を返却
    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  // 引数のディレクトリからファイル名を配列で取得(node.js)
  const fileNames = fs.readdirSync(postsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
        // id: ["rezero", "rem"],
      },
    };
  });
}
/* idを元に、ファイルの中身を返却する */
// export function getPostData(id) {
//   const fullPath = path.join(postsDirectory, `${id}.md`);
//   const fileContents = fs.readFileSync(fullPath, "utf8");

//   // Use gray-matter to parse the post metadata section
//   const matterResult = matter(fileContents);

//   // Combine the data with the id
//   return {
//     id,
//     ...matterResult.data,
//   };
// }

/* マークダウンをレンダリングする */
export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
