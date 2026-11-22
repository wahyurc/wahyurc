import { continueRender, delayRender, staticFile } from "remotion";

const faces: [string, string, string, string?][] = [
  ["Rubik", "rubik-latin-700-normal.woff2", "700"],
  ["Rubik", "rubik-latin-800-normal.woff2", "800"],
  ["Rubik", "rubik-latin-900-normal.woff2", "900"],
  ["Rubik", "rubik-latin-900-italic.woff2", "900", "italic"],
  ["Bungee", "bungee-latin-400-normal.woff2", "400"],
  ["Caveat", "caveat-latin-700-normal.woff2", "700"],
  ["Fredoka", "fredoka-latin-600-normal.woff2", "600"],
  ["Fredoka", "fredoka-latin-700-normal.woff2", "700"],
];

let promise: Promise<void> | null = null;

export const loadFonts = () => {
  if (promise) return promise;
  const handle = delayRender("fonts");
  promise = Promise.all(
    faces.map(async ([family, file, weight, style]) => {
      const ff = new FontFace(family, `url(${staticFile("fonts/" + file)})`, {
        weight,
        style: style ?? "normal",
      });
      await ff.load();
      document.fonts.add(ff);
    })
  )
    .then(() => document.fonts.load("600 20px Inter"))
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    }) as Promise<void>;
  return promise;
};
