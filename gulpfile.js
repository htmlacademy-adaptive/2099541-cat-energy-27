import gulp from "gulp";
import plumber from "gulp-plumber";
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
import GulpClient from "gulp";
import svgo from "gulp-svgo";
import svgostore from "svgstore";

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
      "!source/img/owner-data/*.svg",
      "!source/img/socials/*.svg"
    ])
    .pipe(svgo())
    .pipe(gulp.dest("build/img"));
};

//Sprite
export const sprite = () => {
  return gulp.src([
    "source/img/owner-data/*.svg",
    "source/img/socials/*.svg"
  ])
  .pipe(svgo())
  .pipe(svgostore({inlineSvg: true}))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
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

export default gulp.series(html, styles, server, watcher);
