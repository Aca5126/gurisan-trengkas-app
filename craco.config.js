const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      // Tambah fallback untuk modul Node jika perlu
      webpackConfig.resolve.fallback = {
        fs: false,
        path: false,
      };
      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
    ],
  },
  style: {
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
      ],
    },
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  eslint: {
    enable: true,
    configure: {
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    },
  },
};
