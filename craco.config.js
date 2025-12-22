const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        path: false,
      };
      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      "@babel/plugin-proposal-private-property-in-object",
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
