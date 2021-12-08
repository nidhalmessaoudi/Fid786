const path = require("path");

module.exports = (env) => {
  return {
    mode: env.mode || "production",
    entry: "./client/index.ts",
    devtool: env.mode === "development" ? "inline-source-map" : false,
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "public/js"),
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
  };
};
