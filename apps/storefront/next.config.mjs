/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mrmf/shared"],
  async redirects() {
    return [
      // Retired species (owner Decision D15/D16): King Blue and Elm Oyster were
      // dropped from the lineup, and the generic Enoki page split into Golden
      // and White Enoki. Send any lingering links to the catalog.
      { source: "/mushrooms/king-blue", destination: "/mushrooms", permanent: true },
      { source: "/mushrooms/elm-oyster", destination: "/mushrooms", permanent: true },
      { source: "/mushrooms/enoki", destination: "/mushrooms", permanent: true },
    ];
  },
};

export default nextConfig;
