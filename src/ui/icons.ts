const paths: Record<string, string> = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  volume: '<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="m11 5-6 4H2v6h3l6 4V5Zm6 4 5 6m0-6-5 6"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3.2"/>',
  play: '<path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke-width="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  rotate: '<path d="M3 10a9 9 0 1 1 1.8 8.5M3 4v6h6"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  sparkle: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Zm7-1 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
  leaf: '<path d="M20 4C7 2 2 8 5 15c3 7 15 4 15-11ZM4 21 15 9"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 8.5a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4m.1 3.5h.01"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  box: '<path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v11l9 4 9-4V7m-9 4v11M7 5l10 4"/>',
  blocks: '<rect x="3" y="12" width="8" height="9" rx="1.5"/><rect x="13" y="12" width="8" height="9" rx="1.5"/><path d="m12 2 5 8H7l5-8Z"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1m0-16c4-3 8-2 10-1v16c-3-2-7-1-10 1V5Z"/><path d="M5 8c1.5-.4 3-.2 4 .4m6 0c1-.6 2.5-.8 4-.4"/>',
  train: '<rect x="4" y="4" width="16" height="14" rx="4"/><path d="M4 11h16M12 4v7M7 18l-2 3m12-3 2 3M9 2h6"/><circle cx="8" cy="14.5" r=".6"/><circle cx="16" cy="14.5" r=".6"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c8 1 10 3 12.8 12.8M5.6 18.4c1-8 3-10 12.8-12.8M3 12c6 4 12 4 18 0"/>',
  castle: '<path d="M3 21V8h5v13m8 0V8h5v13M8 12h8M8 21h8M5.5 8V2l4 2-4 2m13 2V2l4 2-4 2M11 21v-5a1 1 0 0 1 2 0v5"/>',
  horse: '<path d="M4 14h12l1-5h4l-1-5-5-2-1 5-4 3H5l-1 4Zm1 0-1 5m11-5 2 5M2 19c6 3 14 3 20 0M16 3l1-2"/><circle cx="18" cy="6" r=".5"/>',
  music: '<path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
  rings: '<ellipse cx="12" cy="19" rx="9" ry="3"/><ellipse cx="12" cy="13" rx="6.5" ry="2.5"/><ellipse cx="12" cy="7.5" rx="4" ry="2"/><path d="M12 2v3.5"/>',
  footprints: '<ellipse cx="7" cy="8" rx="3" ry="5" transform="rotate(-20 7 8)"/><path d="m6 16 1.5 4"/><ellipse cx="17" cy="13" rx="3" ry="5" transform="rotate(20 17 13)"/><path d="m17 21-.5 1"/>',
  mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7m-6 1h12"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};

export function icon(name: string, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.sparkle}</svg>`;
}

export const bunnyLogo = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M18 21C9 10 10 5 14 6c4 0 7 9 7 13m10 2c9-11 8-16 4-15-4 0-7 9-7 13" fill="currentColor"/><ellipse cx="24" cy="29" rx="15" ry="13" fill="currentColor"/><circle cx="19" cy="28" r="1.4" fill="#f9f5e9"/><circle cx="29" cy="28" r="1.4" fill="#f9f5e9"/><path d="m22 33 2 1.5 2-1.5" stroke="#f9f5e9" stroke-width="1.5" stroke-linecap="round"/></svg>';

export const avatar = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#e7ddbf"/><path d="M12 64c0-19 40-19 40 0" fill="#c99066"/><circle cx="32" cy="31" r="19" fill="#edbb91"/><circle cx="12.5" cy="33" r="4" fill="#edbb91"/><circle cx="51.5" cy="33" r="4" fill="#edbb91"/><path d="M13 28C9 0 53-2 51 28l-4-7-6 1-7-5-3 5-8-2-5 5Z" fill="#44382e"/><ellipse cx="25" cy="32" rx="1.7" ry="2.2" fill="#43392c"/><ellipse cx="39" cy="32" rx="1.7" ry="2.2" fill="#43392c"/><ellipse cx="21" cy="38" rx="4" ry="2" fill="#e5a087"/><ellipse cx="43" cy="38" rx="4" ry="2" fill="#e5a087"/><path d="M29 40q3 3 6 0" fill="none" stroke="#ae745a" stroke-width="1.5" stroke-linecap="round"/><path d="M23 55v9m18-9v9" stroke="#ead7b1" stroke-width="3"/></svg>';
