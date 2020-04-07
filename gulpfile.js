import { task, src, dest } from 'gulp';

task('default', () => src(['./*'], {
  base: '.',
}).pipe(dest('build')));
