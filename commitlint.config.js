module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',
          'build',
          'fix',
          'chore',
          'docs',
          'style',
          'refactor',
          'test',
          'ci',
          'perf',
        ],
      ],
      'scope-case': [2, 'always', 'kebab-case'],
      'subject-full-stop': [2, 'never', '.'],
      'subject-case': [2, 'always', ['sentence-case']],
      'header-max-length': [2, 'always', 150],
    },
  };
  