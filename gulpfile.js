'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const env = require('gulp-env');
const eslint = require('gulp-eslint');
const istanbul = require('gulp-istanbul');
const shell = require('gulp-shell');

gulp.task('lint-server', function() {
    return gulp.src(['src/**/*.js', '!src/public/**/*.js'])
        .pipe(eslint({
            envs: [ 'es6', 'node' ],
            rules: {
                'no-unused-vars': [2, {'argsIgnorePattern': 'next'}]
            }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
        
gulp.task('lint-client', function() {
    return gulp.src('src/public/**/*.js')
        .pipe(eslint({ envs: [ 'browser', 'jquery' ],
                       globals: { io: false } }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint-test', function() {
    return gulp.src('test/**/*.js')
        .pipe(eslint({ envs: [ 'es6', 'node', 'mocha' ] }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint-integration-test', function() {
    return gulp.src('integration-test/**/*.js')
        .pipe(eslint({
            envs: [ 'browser', 'phantomjs', 'jquery' ],
            rules: { 'no-console': 0 }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('instrument', function() {
    return gulp.src('src/**/*.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
});

gulp.task('test', ['lint-test', 'instrument'], function() {
  env({ vars: { NODE_ENV: 'test' } });
  return gulp.src('test/**/*.js')
    .pipe(mocha())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          statements: 80,
          branches: 60
        }
      }
    }));
});

gulp.task('integration-test', ['lint-integration-test', 'test'], (done) => {
    const TEST_PORT = 5000;
  
    require('./src/server.js').then((server) => {
        server.listen(TEST_PORT);
        server.on('listening', () => {
            gulp.src('integration-test/**/*.js')
                .pipe(shell('node node_modules/phantomjs-prebuilt/bin/phantomjs <%=file.path%>', {
                    env: { 'TEST_PORT': TEST_PORT }
                }))
                .on('error', error => server.close(() => done(error)))
                .on('end', () => server.close(done))
        });
  });
});

gulp.task('lint', ['lint-server', 'lint-client', 'lint-test', 'lint-integration-test']);
gulp.task('default', ['lint', 'test']);
