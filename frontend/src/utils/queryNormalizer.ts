/**
 * Typo normalizer for music searches, artist names, transliterated queries, and common spelling errors
 */
export function normalizeQueryTypo(query: string): string {
  if (!query || typeof query !== 'string') return '';
  let q = query.trim();

  // 1. General vowel reduction for common repeated letters (e.g. aashiquiii -> aashiqui)
  q = q.replace(/\ba+sh+i+q+u+[iey]+(\s*2)?\b/gi, (_, g1) => (g1 ? 'aashiqui 2' : 'aashiqui'));
  q = q.replace(/\ba+sh+i+k+[iey]+(\s*2)?\b/gi, (_, g1) => (g1 ? 'aashiqui 2' : 'aashiqui'));
  q = q.replace(/\ba+sh+e+k+[iey]+(\s*2)?\b/gi, (_, g1) => (g1 ? 'aashiqui 2' : 'aashiqui'));
  q = q.replace(/\ba+sh+q+i+(\s*2)?\b/gi, (_, g1) => (g1 ? 'aashiqui 2' : 'aashiqui'));

  const typoMap: Array<[RegExp, string]> = [
    // Popular Bollywood & Indian artists
    [/\b(a+ri+j+i+t+|arjit|arijet)\b/gi, 'arijit singh'],
    [/\b(di+l+j+i+t+|diljit\s*dosanj)\b/gi, 'diljit dosanjh'],
    [/\bsidhu\s*mosewala\b/gi, 'sidhu moose wala'],
    [/\bsidhu\s*moosewala\b/gi, 'sidhu moose wala'],
    [/\bap\s*dhilon\b/gi, 'ap dhillon'],
    [/\bhoney\s*sing\b/gi, 'honey singh'],
    [/\byo\s*yo\s*honey\b/gi, 'yo yo honey singh'],
    [/\bshreya\s*goshal\b/gi, 'shreya ghoshal'],
    [/\bshreya\s*ghosal\b/gi, 'shreya ghoshal'],
    [/\barman\s*malik\b/gi, 'armaan malik'],
    [/\batif\s*aslem\b/gi, 'atif aslam'],
    [/\bjubin\s*notiyal\b/gi, 'jubin nautiyal'],
    [/\bjubin\s*notial\b/gi, 'jubin nautiyal'],
    [/\bkishor\s*kumar\b/gi, 'kishore kumar'],
    [/\bkaran\s*aujlaa\b/gi, 'karan aujla'],
    [/\bkabir\s*sing\b/gi, 'kabir singh'],

    // Western artists & genres
    [/\bweeknd\b/gi, 'the weeknd'],
    [/\bweekend\b/gi, 'the weeknd'],
    [/\bed\s*sheran\b/gi, 'ed sheeran'],
    [/\btaylor\s*swft\b/gi, 'taylor swift'],
    [/\bdua\s*lipaa\b/gi, 'dua lipa'],
    [/\bjim\b/gi, 'gym'],
    [/\bexersise\b/gi, 'exercise'],
    [/\bphonck\b/gi, 'phonk'],
    [/\bphunk\b/gi, 'phonk'],
    [/\blofy\b/gi, 'lofi'],
    [/\blo\s*fi\b/gi, 'lofi'],
    [/\breccomend\b/gi, 'recommend'],
    [/\brecoomend\b/gi, 'recommend'],
    [/\bbolywood\b/gi, 'bollywood'],
    [/\bbolliwood\b/gi, 'bollywood'],
  ];

  for (const [regex, replacement] of typoMap) {
    q = q.replace(regex, replacement);
  }

  return q;
}
