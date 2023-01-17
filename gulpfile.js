import gulp from "gulp";
import plumber from "gulp-plumber";
import sourceMap from "gulp-sourcemaps";
import less from "gulp-less";
import postcss from "gulp-postcss";
import csso from "postcss-csso";
import rename from "gulp-rename";
import autoprefixer from "autoprefixer";
import browser from "browser-sync";
import htmlmin from "gulp-htmlmin";
import terser from "gulp-terser";
import gulpSquoosh from "gulp-squoosh";
import libSquoosh from "gulp-libsquoosh";
import svgo from "gulp-svgo";
import svgostore from "svgstore";
import {deleteAsync as del} from 'del';

// Styles

export const styles = () => {
  return gulp
    .src("source/less/style.less", { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css", { sourcemaps: "." }))
    .pipe(browser.stream());
};

//HTML
const html = () => {
  return gulp
    .src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
};

//Scripts
const scripts = () => {
  return gulp.src("source/js/*.js")
  .pipe(terser())
  .pipe(gulp.dest("build/js"));
};

//Images
const optimizeImages = () => {
  return gulp
    .src("source/img/**/*.{jpg,png}")
    .pipe(gulpSquoosh())
    .pipe(gulp.dest("build/img"));
};

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(gulp.dest("build/img"));
};

//WebP
const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(
      libSquoosh({
        webp: {},
      })
    )
    .pipe(gulp.dest("build/img"));
};

//SVG
const optimizeSvg = () => {
  return gulp.src([
      "source/img/**/*.svg",
      "!source/img/icons/*.svg"
    ])
    .pipe(svgo())
    .pipe(gulp.dest("build/img"));
};

//Sprite
export const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
  .pipe(svgo())
  .pipe(svgostore({inlineSvg: true}))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
};

//Copy
const copy = (done) => {
  gulp.src(["source/fonts/**/*.{woff2,woff}", "source/*.ico"],
  {base: "source"}
  )
  .pipe(gulp.dest("build"))
  done();
};

//Clean
const clean = () => {
  return del("build")
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch("source/*.html").on("change", browser.reload);
};

//Build
const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    optimizeSvg,
    sprite,
    createWebp
  ),
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    optimizeSvg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
