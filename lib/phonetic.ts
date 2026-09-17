/**
 * Compact English phonetic key (simplified Metaphone). Two words with the same
 * key sound alike to a speech recognizer: hat/head → "HT", sam/some → "SM",
 * their/there → "0R". Used to forgive recognizer substitutions that a listening
 * adult would never have counted as misreads.
 */
export function phoneticKey(input: string): string {
  let w = input.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return "";

  // Leading exceptions
  if (/^(kn|gn|pn|ae|wr)/.test(w)) w = w.slice(1);
  if (w.startsWith("x")) w = "s" + w.slice(1);
  if (w.startsWith("wh")) w = "w" + w.slice(2);

  const out: string[] = [];
  const isVowel = (c: string | undefined) => !!c && "aeiou".includes(c);

  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    const prev = w[i - 1];
    const next = w[i + 1];
    const next2 = w[i + 2];

    // Collapse doubles (except c, handled by rules)
    if (c === prev && c !== "c") continue;

    switch (c) {
      case "a":
      case "e":
      case "i":
      case "o":
      case "u":
        if (i === 0) out.push("A"); // keep a leading vowel as a class
        break;
      case "b":
        if (!(prev === "m" && i === w.length - 1)) out.push("B");
        break;
      case "c":
        if (next === "i" && next2 === "a") out.push("X");
        else if (next === "h") {
          out.push("X");
          i++;
        } else if (next && "eiy".includes(next)) out.push("S");
        else out.push("K");
        break;
      case "d":
        if (next === "g" && next2 && "eiy".includes(next2)) {
          out.push("J");
          i++;
        } else out.push("T");
        break;
      case "g":
        if (next === "h" && !isVowel(next2)) break; // silent gh
        if (next === "n") break; // gn
        if (next && "eiy".includes(next)) out.push("J");
        else out.push("K");
        break;
      case "h":
        if (isVowel(next) && !(prev && "csptg".includes(prev))) out.push("H");
        break;
      case "k":
        if (prev !== "c") out.push("K");
        break;
      case "p":
        if (next === "h") {
          out.push("F");
          i++;
        } else out.push("P");
        break;
      case "q":
        out.push("K");
        break;
      case "s":
        if (next === "h") {
          out.push("X");
          i++;
        } else if (next === "i" && (next2 === "o" || next2 === "a")) out.push("X");
        else out.push("S");
        break;
      case "t":
        if (next === "h") {
          out.push("0");
          i++;
        } else if (next === "i" && (next2 === "o" || next2 === "a")) out.push("X");
        else out.push("T");
        break;
      case "v":
        out.push("F");
        break;
      case "w":
      case "y":
        if (isVowel(next)) out.push(c.toUpperCase());
        break;
      case "x":
        out.push("K", "S");
        break;
      case "z":
        out.push("S");
        break;
      default:
        out.push(c.toUpperCase()); // f j l m n r
    }
  }
  return out.join("");
}

export function soundsAlike(a: string, b: string): boolean {
  const ka = phoneticKey(a);
  const kb = phoneticKey(b);
  return ka.length > 0 && ka === kb;
}
