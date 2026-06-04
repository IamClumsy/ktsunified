import nextConfig from "eslint-config-next";
import tsConfig from "eslint-config-next/typescript";
import coreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  ...tsConfig,
  ...coreWebVitals,
  {
    rules: {
      // setState inside useEffect is the correct SSR-safe pattern for reading
      // localStorage / external state on mount in Next.js. Downgrade to warn.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
