const generateCard = require("./build").generateCard;
const path = require("path");
const fs = require("fs");

function base64file(path) {
  const b64 = fs.readFileSync(path, "base64");
  return `data:image/jpeg;base64,${b64}`;
}

exports.onCreateNode = ({ node, getNode, actions, graphql }, options) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark` || node.internal.type === `Mdx`) {
    const post = node.frontmatter;

    let authorImage64;
    if (options.authorImage && fs.existsSync(options.authorImage)) {
      authorImage64 = base64file(options.authorImage);
    }

    let cover = options.backgroundImage;
    const coverImageField = options.coverImageField || "coverImage";
    if (post[coverImageField]) {
      const { dir } = getNode(node.parent);
      cover = path.join(dir, post[coverImageField]);
    }
    const filename = "social-card-" + node.id + ".jpg";
    const output = path.join("./public/social-card-images/", filename);
    const outputDirectory = options.outputDirectory || "social-card-images";
    const author = post.author || options.defaultAuthor;
    const subtitle = author ? `by ${author}` : "";

    generateCard(
      {
        title: post.title,
        subtitle,
        backgroundImage: cover,
        design: options.design,
        authorImage64,
      },
      output,
      outputDirectory
    )
      .then(() => {
        console.log(post.title, "generated: " + output);
        try {
          createNodeField({
            node,
            name: `socialcard`,
            value: `./social-card-images/${filename}`,
          });
        } catch (err) {
          console.error("createNodeField failed");
        }
      })
      .catch((err) => {
        console.error("ERROR while generating card", err);
      });
  }
};
