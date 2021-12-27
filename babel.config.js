module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@client': './src/Bot',
          '@structures': './src/structures',
          '@utils': './src/utils',
        },
      },
    ],
  ],
}
