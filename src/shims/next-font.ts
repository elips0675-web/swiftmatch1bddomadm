// Stub for next/font/google — returns CSS variable name placeholders.
function makeFont() {
  return {
    className: "",
    style: { fontFamily: "inherit" },
    variable: "",
  };
}
export const Poppins = (_opts?: any) => makeFont();
export const Quicksand = (_opts?: any) => makeFont();
export const Inter = (_opts?: any) => makeFont();
export default makeFont;
