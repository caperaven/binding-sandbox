/**
 * Build script using deno
 * https://droces.github.io/Deno-Cheat-Sheet/
 */

import { copy, emptyDir, ensureDir } from "https://deno.land/std@0.149.0/fs/mod.ts";
import * as esbuild from 'https://deno.land/x/esbuild@v0.14.50/mod.js'
import init, {minify} from "https://wilsonl.in/minify-html/deno/0.9.2/index.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
await init();

async function createFolderStructure() {
    await ensureDir("./dist");
    await emptyDir("./dist");

    await ensureDir("./dist/styles/views");
    await ensureDir("./dist/components");
    await ensureDir("./dist/src");

    for (const folder of ["404", "about", "form", "welcome"]) {
        await ensureDir(`./dist/app/${folder}`);
    }
}

async function packageDirectory(def, loader, format, minified) {
    for (const dir of def.dir) {
        for await (const dirEntry of Deno.readDir(dir)) {
            if (dirEntry.isDirectory) {
                continue;
            }

            const sourceFile = `${dir}/${dirEntry.name}`;

            let targetFile = `${def.target}${dir}/${dirEntry.name}`;
            let keys = Object.keys(def.replace || {});
            for (const key of keys) {
                targetFile = targetFile.replace(key, def.replace[key]);
            }

            await packageFile(sourceFile, targetFile, loader, format, minified);
        }
    }
}

async function packageFiles(def, loader, format, minified) {
    for (const file of def.files) {
        const target = file.replace("./src", "./dist");
        await packageFile(file, target, loader, format, minified);
    }
}

async function packageFile(sourceFile, targetFile, loader, format, minified) {
    const src = await Deno.readTextFile(sourceFile);
    const result = await esbuild.transform(src, { loader: loader, minify: minified, format: format });
    await Deno.writeTextFile(targetFile, result.code);
}

async function packageMarkup(sourceFile, targetFile, minified) {
    let src = await Deno.readTextFile(sourceFile);

    if (minified == true) {
        src = src
            .split("\t").join("")
            .split("\r").join("")
            .split("\n").join("")
            .split(" ").join("");
    }

    await Deno.writeTextFile(targetFile, src);
}

async function packageHTML(sourceFile, targetFile, minified) {
    let src = await Deno.readTextFile(sourceFile);

    if (minified == true) {
        src = decoder.decode(minify(encoder.encode(src), { minify_css: true, minify_js: true, do_not_minify_doctype: true, keep_closing_tags: true }));
    }

    await Deno.writeTextFile(targetFile, src);
}

async function bundleJs(file, output, minified) {
    const result = await esbuild.build({
        entryPoints: [file],
        bundle: true,
        outfile: output,
        format: "esm",
        minify: minified
    })

    console.log(result);
}

async function bundleCss(file, output, minified) {
    const result = await esbuild.build({
        entryPoints: [file],
        bundle: true,
        loader: {".css": "css"},
        outfile: output,
        minify: minified
    })

    console.log(result);
}

await createFolderStructure();

const minified = false;

// routes
await packageMarkup("./app/routes.json", "./dist/app/routes.json", minified);

// html files
await packageHTML("./app/404/404.html", "./dist/app/404/404.html", minified);
await packageHTML("./app/about/about.html", "./dist/app/about/about.html", minified);
await packageHTML("./app/form/form.html", "./dist/app/form/form.html", minified);
await packageHTML("./app/welcome/simulation.html", "./dist/app/welcome/simulation.html", minified);

// css files
await bundleCss("./styles/styles.css", "./dist/styles/styles.css", minified);
await packageMarkup("./styles/views/404.css", "./dist/styles/views/404.css", minified);
await packageMarkup("./styles/views/about.css", "./dist/styles/views/about.css", minified);
await packageMarkup("./styles/views/welcome.css", "./dist/styles/views/welcome.css", minified);

// js files
await bundleJs("./index.js", "./dist/index.js", minified);
await packageFile("./app/form/form.js", "./dist/app/form/form.js", "js", "esm", minified);
await packageFile("./app/welcome/simulation.js", "./dist/app/welcome/simulation.js", "js", "esm", minified);

// copy files
await packageHTML("./index.html", "./dist/index.html", minified);
await Deno.copyFile("./favicon.ico", "./dist/favicon.ico");
await copy("./packages", "./dist/packages");

// components
await packageFile("./components/component.js", "./dist/components/component.js", "js", "esm", minified);

// src
await packageFile("./src/my-class.js", "./dist/src/my-class.js", "js", "esm", minified);

Deno.exit(0);
