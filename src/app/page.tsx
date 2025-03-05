import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

async function getPostFiles() {
  const postsDirectory = path.join(process.cwd(), "posts");
  const filenames = await fs.readdir(postsDirectory);
  return filenames.filter((filename) => filename.endsWith(".md"));
}

async function getPostData(filename: string) {
  const postsDirectory = path.join(process.cwd(), "posts");
  const filePath = path.join(postsDirectory, filename);
  const fileContents = await fs.readFile(filePath, "utf8");

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html, { sanitize: false })
    .use(remarkGfm)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  return {
    id: matterResult.data.id || filename.replace(/\.md$/, ""),
    headline: {
      text: matterResult.data.headline,
      type: matterResult.data.headlineType,
      author: matterResult.data.author,
      authorType: matterResult.data.authorType,
      subheadline: matterResult.data.subheadline,
      subheadlineType: matterResult.data.subheadlineType,
    },
    contentHtml: contentHtml,
  };
}

async function getAllPosts() {
  const fileNames = await getPostFiles();
  const allPostsData = await Promise.all(
    fileNames.map(async (fileName) => {
      return getPostData(fileName);
    })
  );

  return allPostsData.sort((a, b) => {
    if (a.id < b.id) {
      return -1;
    } else {
      return 1;
    }
  });
}

function processHtmlContent(htmlContent: string) {
  let citation = null;

  const startIdx = htmlContent.indexOf("<blockquote>");
  if (startIdx !== -1) {
    const endIdx = htmlContent.indexOf("</blockquote>", startIdx);
    if (endIdx !== -1) {
      const blockquoteContent = htmlContent.substring(startIdx + 12, endIdx);
      citation = blockquoteContent.replace(/<p>(.*?)<\/p>/g, "$1").trim();

      htmlContent =
        htmlContent.substring(0, startIdx) + htmlContent.substring(endIdx + 13);
    }
  }

  return {
    contentHtml: htmlContent,
    citation,
  };
}

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="container">
      <div className="head">
        <div className="headerobjectswrapper">
          <header>The Daily Prophet</header>
        </div>
        <div className="subhead">
          Hogwarts - Thursday August 30, 1978 - Seven Pages
        </div>
      </div>

      <div className="content">
        <div className="collumns">
          {posts.map((post) => {
            const { contentHtml, citation } = processHtmlContent(
              post.contentHtml
            );

            return (
              <div key={post.id} className="collumn">
                <div className="head">
                  <span className={`headline ${post.headline.type}`}>
                    {post.headline.text}
                  </span>
                  {post.headline.author && (
                    <p>
                      <span className={`headline ${post.headline.authorType}`}>
                        {post.headline.author}
                      </span>
                    </p>
                  )}
                  {post.headline.subheadline && (
                    <p>
                      <span
                        className={`headline ${post.headline.subheadlineType}`}
                      >
                        {post.headline.subheadline}
                      </span>
                    </p>
                  )}
                </div>

                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

                {citation && <span className="citation">{citation}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
