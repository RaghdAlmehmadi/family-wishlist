/* =====================================================================
   art.js — Winter Christmas Elegance
   الأيقونات الخطية، الأعلام، مشهد الهيدر الشتوي مع ماما وروان، والثلج
   ===================================================================== */
(function () {
  'use strict';

  const L = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" class="sprite" aria-hidden="true" focusable="false">
  <defs>
    <clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
  </defs>
  <symbol id="flag-fr" viewBox="0 0 3 2">
    <rect width="1" height="2" fill="#002654"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#CE1126"/>
  </symbol>
  <symbol id="flag-uk" viewBox="0 0 60 30">
    <g clip-path="url(#uk-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-t)" stroke="#C8102E" stroke-width="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
    </g>
  </symbol>

  <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.6l4.4 4.4L19 7.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><g ${L}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></g></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></symbol>
  <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" ${L}/></symbol>
  <symbol id="i-camera" viewBox="0 0 24 24"><g ${L}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.3"/></g></symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><g ${L}><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M5 17l4.5-4.5 3 3 2.5-2.5L19 17"/></g></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" ${L}/></symbol>
  <symbol id="i-edit" viewBox="0 0 24 24"><path d="M5 19l1-4L15.5 5.5a2 2 0 0 1 3 3L9 18z" ${L}/></symbol>
  <symbol id="i-share" viewBox="0 0 24 24"><g ${L}><circle cx="9" cy="9" r="3"/><path d="M3.5 19c.8-3 3-4.6 5.5-4.6s4.7 1.6 5.5 4.6"/><circle cx="16.5" cy="8" r="2.4"/><path d="M15.5 13.2c2.4-.2 4.3 1.2 5 3.8"/></g></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24"><g ${L}><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></g></symbol>
  <symbol id="i-group" viewBox="0 0 24 24"><g ${L}><circle cx="12" cy="8.4" r="3"/><path d="M6.6 19c.6-3 2.8-4.8 5.4-4.8s4.8 1.8 5.4 4.8"/><circle cx="5.6" cy="10.2" r="2.1"/><path d="M2.6 17.6c.4-2 1.6-3.2 3.2-3.5"/><circle cx="18.4" cy="10.2" r="2.1"/><path d="M21.4 17.6c-.4-2-1.6-3.2-3.2-3.5"/></g></symbol>
  <symbol id="i-snow" viewBox="0 0 24 24"><g ${L} stroke-width="1.3"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.6l2 1.6 2-1.6M10 19.4l2-1.6 2 1.6M4.7 10l2.4-.9-.4-2.5M19.3 14l-2.4.9.4 2.5M4.7 14l2.4.9-.4 2.5M19.3 10l-2.4-.9.4-2.5"/></g></symbol>

  <symbol id="s-pharmacy" viewBox="0 0 24 24"><g ${L}><rect x="5.5" y="8" width="13" height="12.5" rx="2.2"/><rect x="7.5" y="3.5" width="9" height="4.5" rx="1"/><path d="M12 11v6.4M8.8 14.2h6.4"/></g></symbol>
  <symbol id="s-makeup" viewBox="0 0 24 24"><g ${L}><rect x="8" y="13.5" width="8" height="7.5" rx="1.2"/><path d="M9 13.5v-3.6h6v3.6"/><path d="M10 9.9V5.6l4-2.1v6.4"/></g></symbol>
  <symbol id="s-perfumes" viewBox="0 0 24 24"><g ${L}><rect x="9.5" y="3" width="5" height="3" rx=".8"/><path d="M11 6v2.2M13 6v2.2"/><rect x="5.5" y="8.2" width="13" height="12.8" rx="3.6"/><path d="M9 15h6"/></g></symbol>
  <symbol id="s-bags" viewBox="0 0 24 24"><g ${L}><path d="M5 9h14l-1.2 11.2H6.2z"/><path d="M9 9V7.2a3 3 0 0 1 6 0V9"/></g></symbol>
  <symbol id="s-fashion" viewBox="0 0 24 24"><g ${L}><path d="M10.1 6.4A1.9 1.9 0 1 1 12 8.6v1.6"/><path d="M12 10.2l-8.2 5.6a1 1 0 0 0 .6 1.8h15.2a1 1 0 0 0 .6-1.8z"/></g></symbol>
  <symbol id="s-gifts" viewBox="0 0 24 24"><g ${L}><circle cx="12" cy="15" r="5.6"/><path d="M9.6 6.4L12 4l2.4 2.4L12 9.4z"/></g></symbol>
  <symbol id="s-toys" viewBox="0 0 24 24"><g ${L}><path d="M6.6 9.96A2.4 2.4 0 1 1 9.4 7.46M14.6 7.46A2.4 2.4 0 1 1 17.4 9.96"/><circle cx="12" cy="13.2" r="6.3"/><ellipse cx="12" cy="15.7" rx="2.5" ry="1.9"/><path d="M9.6 12.1h.01M14.4 12.1h.01M11.5 15.2h1"/></g></symbol>
  <symbol id="s-all" viewBox="0 0 24 24"><g ${L}><rect x="4.5" y="9" width="15" height="11" rx="1.5"/><path d="M3.5 6.5h17V9h-17zM12 6.5V20"/><path d="M12 6.5c-1.6-3-5.6-3-4.5-.5.6 1.1 2.6.5 4.5.5zM12 6.5c1.6-3 5.6-3 4.5-.5-.6 1.1-2.6.5-4.5.5z"/></g></symbol>
</svg>`;

  // =================================================================
  //  مشهد الهيدر
  // =================================================================
  const C = {
    fur: '#FBFCFE', furShade: '#DDE5EF',
    skin: '#EEC9AE', skinShade: '#DDAE92',
    ink: '#2B1E1C', gold: '#C9AE72', goldDeep: '#A88C55',
    warm: '#FFE2A0',
  };
  const f1 = (n) => Math.round(n * 10) / 10;

  // كرة ضوء دافئة (بدون فلاتر ثقيلة)
  const glow = (x, y, r, op) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="url(#hs-glow)" opacity="${op || 1}"/>`;
  const bulb = (x, y, color, d) => `<g class="hs-bulb" style="--d:${d}s">${glow(x, y, 7.5, .75)}<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${color}"/></g>`;

  function star5(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + f1(cx + rr * Math.cos(a)) + ',' + f1(cy + rr * Math.sin(a));
    }
    return d + 'Z';
  }

  // شجرة كريسماس مضاءة
  function tree(x, base, h, w, seed) {
    const tiers = 4;
    let out = `<rect x="${f1(x - 5)}" y="${f1(base - 16)}" width="10" height="16" rx="2" fill="#3E2C24"/>`;
    const lights = [];
    for (let i = 0; i < tiers; i++) {
      const top = base - h + i * h * 0.2;
      const bottom = top + h * (0.32 + i * 0.04);
      const hw = w * (0.2 + i * 0.12);
      const sag = 7 + i * 2;
      out += `<path d="M${f1(x)},${f1(top)} C${f1(x + hw * 0.35)},${f1(top + (bottom - top) * 0.45)} ${f1(x + hw * 0.8)},${f1(bottom - 6)} ${f1(x + hw)},${f1(bottom)} Q${f1(x)},${f1(bottom + sag)} ${f1(x - hw)},${f1(bottom)} C${f1(x - hw * 0.8)},${f1(bottom - 6)} ${f1(x - hw * 0.35)},${f1(top + (bottom - top) * 0.45)} ${f1(x)},${f1(top)} Z" fill="url(#hs-tree)"/>`;
      out += `<path d="M${f1(x + hw)},${f1(bottom)} Q${f1(x)},${f1(bottom + sag)} ${f1(x - hw)},${f1(bottom)}" fill="none" stroke="#EAF2F8" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`;
      // سلسلة أضواء مائلة على كل طبقة
      const n = 3 + i;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.6) / (n + 0.2);
        const lx = x - hw * 0.85 + t * hw * 1.7;
        const ly = bottom - 10 - (1 - Math.abs(t - 0.5) * 2) * 2 + (t - 0.5) * 8;
        lights.push([lx, ly]);
      }
    }
    const cols = ['#FFE7B0', '#FFD27A', '#FFF3DA', '#F7C3C9'];
    out += lights.map(([lx, ly], k) => bulb(lx, ly, cols[(k + seed) % cols.length], ((k * 0.41 + seed) % 2.6).toFixed(2))).join('');
    const sy = base - h - 4;
    out += glow(x, sy, 18, .9) + `<path d="${star5(x, sy, 8, 3.4)}" fill="#F1D48A"/>`;
    return out;
  }

  function gift(x, y, w, h, fill, shade) {
    return `<g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}"/>
      <rect x="${x + w * 0.62}" y="${y}" width="${w * 0.38}" height="${h}" rx="2" fill="${shade}" opacity=".35"/>
      <rect x="${x - 1.5}" y="${y - 4}" width="${w + 3}" height="6" rx="1.5" fill="${fill}"/>
      <rect x="${x + w / 2 - 2}" y="${y - 4}" width="4" height="${h + 4}" fill="${C.gold}"/>
      <path d="M${x + w / 2},${y - 4} c-6,-8 -12,-2 -6,1 z M${x + w / 2},${y - 4} c6,-8 12,-2 6,1 z" fill="${C.gold}"/>
    </g>`;
  }

  // مبانٍ أوروبية بنوافذ مضاءة
  function buildings() {
    const B = [[118, 300, 46, 'm'], [166, 286, 52, 'm'], [222, 304, 40, 'g'], [404, 296, 46, 'g'], [452, 282, 54, 'm'], [508, 302, 44, 'm']];
    let out = '';
    B.forEach(([x, top, w, roof], bi) => {
      const roofH = roof === 'm' ? 16 : 12;
      out += `<rect x="${x}" y="${top}" width="${w}" height="${372 - top}" fill="#22385C"/>`;
      out += roof === 'm'
        ? `<path d="M${x - 2},${top} L${x + 6},${top - roofH} H${x + w - 6} L${x + w + 2},${top} Z" fill="#1C2F4E"/><rect x="${x + w * 0.7}" y="${top - roofH - 8}" width="6" height="10" fill="#1C2F4E"/>`
        : `<path d="M${x - 2},${top} L${x + w / 2},${top - roofH - 6} L${x + w + 2},${top} Z" fill="#1C2F4E"/>`;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          const wx = x + 7 + c * ((w - 14) / 3 + 0.5);
          const wy = top + 10 + r * 16;
          if (wy > 352) continue;
          const lit = ((bi * 7 + r * 3 + c * 5) % 4) !== 0;
          out += `<rect x="${f1(wx)}" y="${wy}" width="${f1((w - 14) / 3 - 3)}" height="9" rx="1" fill="${lit ? '#F4D18D' : '#2C4670'}" opacity="${lit ? '.85' : '1'}"/>`;
        }
      }
    });
    return out;
  }

  // امرأة بالغة بمعطف سانتا أنيق
  function woman(o) {
    const k = o.flip ? -1 : 1;
    const red = o.red, redDeep = o.redDeep, id = o.id;
    const coat = 'M-21,-189 C-25,-180 -21,-161 -15.5,-147 C-26,-108 -38,-58 -44,-18 Q0,-9 44,-18 C38,-58 26,-108 15.5,-147 C21,-161 25,-180 21,-189 Q0,-196 -21,-189 Z';
    const fw = o.faceW;
    const face = `M0,-230.5 C${f1(fw * 0.64)},-230.5 ${fw},-224 ${fw},-215 C${fw},-206.5 ${f1(fw * 0.52)},-197 0,-196.4 C${f1(-fw * 0.52)},-197 ${-fw},-206.5 ${-fw},-215 C${-fw},-224 ${f1(-fw * 0.64)},-230.5 0,-230.5 Z`;
    // عين لوزية هادئة: الجفن العلوي يغطي جزءًا من القزحية، وخط كحل رفيع عند الطرف الخارجي
    const eye = (cx) => {
      const o2 = cx < 0 ? -1 : 1;
      const inner = f1(cx - o2 * 3.8), outer = f1(cx + o2 * 3.8);
      const shape = `M${inner},-214.2 Q${cx},-218.7 ${outer},-214.7 Q${f1(cx + o2 * 0.4)},-211.4 ${inner},-214.2 Z`;
      const cid = `eye-${id}-${o2 < 0 ? 'l' : 'r'}`;
      return `
      <clipPath id="${cid}"><path d="${shape}"/></clipPath>
      <path d="${shape}" fill="#FFFDFB"/>
      <g clip-path="url(#${cid})">
        <circle cx="${cx}" cy="-214.5" r="2.35" fill="#5E3B2E"/><circle cx="${cx}" cy="-214.5" r="1.2" fill="#21120E"/>
        <circle cx="${f1(cx + 0.8)}" cy="-215.3" r=".55" fill="#fff"/>
      </g>
      <path d="M${inner},-214.3 Q${cx},-219.2 ${outer},-214.8 l${f1(o2 * 1.3)},-.8" fill="none" stroke="#2A1915" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${f1(cx - 2.7)},-212.4 Q${cx},-211.6 ${f1(cx + 2.7)},-212.4" fill="none" stroke="#C3927E" stroke-width=".5" opacity=".6"/>`;
    };

    const giftHeld = o.gifts === 'stack' ? `
        <rect x="-16" y="-124" width="32" height="20" rx="2" fill="#CBE7D8"/><rect x="5" y="-124" width="11" height="20" rx="2" fill="#9CC9B2" opacity=".45"/>
        <rect x="-2" y="-124" width="4" height="20" fill="${C.gold}"/>
        <rect x="-11" y="-141" width="22" height="17" rx="2" fill="#DCD2F3"/><rect x="3.5" y="-141" width="7.5" height="17" rx="2" fill="#B4A6DE" opacity=".45"/>
        <rect x="-1.7" y="-141" width="3.4" height="17" fill="${C.gold}"/><rect x="-11" y="-134" width="22" height="3" fill="${C.gold}"/>
        <path d="M0,-141 c-6,-8 -12,-2 -6,1 z M0,-141 c6,-8 12,-2 6,1 z" fill="${C.gold}"/>`
      : `
        <rect x="-16" y="-133" width="32" height="27" rx="2.2" fill="#F2C6D0"/><rect x="4.5" y="-133" width="11.5" height="27" rx="2" fill="#DB9DAD" opacity=".45"/>
        <rect x="-2.1" y="-133" width="4.2" height="27" fill="${C.gold}"/><rect x="-16" y="-121.5" width="32" height="3.8" fill="${C.gold}"/>
        <path d="M0,-133 c-7,-9 -14,-2 -7,1.2 z M0,-133 c7,-9 14,-2 7,1.2 z" fill="${C.gold}"/>`;

    return `
    <g transform="translate(${o.x},${o.y}) scale(${o.s})">
      <ellipse cy="2" rx="44" ry="6" fill="#0D1830" opacity=".35"/>
      <!-- غطاء الرأس من الخلف وذيله -->
      <path d="M${-6 * k},-238 C${14 * k},-247 ${34 * k},-233 ${36 * k},-210 C${37 * k},-197 ${34 * k},-187 ${30 * k},-180 L${25 * k},-182 C${27 * k},-195 ${26 * k},-213 ${18 * k},-226 C${12 * k},-233 ${4 * k},-236 ${-6 * k},-238 Z" fill="${redDeep}"/>
      <circle cx="${29 * k}" cy="-178" r="5.6" fill="${C.fur}"/><circle cx="${30.5 * k}" cy="-176.5" r="3" fill="${C.furShade}" opacity=".6"/>
      <!-- الحذاء -->
      <path d="M-15,-14 h11 v9 q0,5 -5,5 h-9 q-4,0 -3,-4 z" fill="#3A2B33"/><path d="M4,-14 h11 v10 q0,4 4,4 h-12 q-4,0 -3,-4 z" fill="#3A2B33"/>
      <!-- المعطف -->
      <clipPath id="cl-${id}"><path d="${coat}"/></clipPath>
      <path d="${coat}" fill="${red}"/>
      <g clip-path="url(#cl-${id})">
        <path d="M7,-200 C18,-150 28,-90 40,0 L60,0 L60,-200 Z" fill="${redDeep}" opacity=".5"/>
        <path d="M-30,-200 C-22,-150 -28,-80 -40,0 L-60,0 L-60,-200 Z" fill="#fff" opacity=".07"/>
        <path d="M-9,-140 C-13,-100 -18,-60 -23,-18 M12,-140 C17,-100 22,-60 27,-18" fill="none" stroke="${redDeep}" stroke-width="1.3" opacity=".55"/>
        <rect x="-60" y="-153" width="120" height="6.5" fill="#2E2430"/>
      </g>
      <rect x="-4.5" y="-188" width="9" height="172" rx="3.5" fill="${C.fur}"/>
      <rect x="1.5" y="-188" width="3" height="172" rx="1.5" fill="${C.furShade}" opacity=".7"/>
      <rect x="-6.5" y="-155" width="13" height="10.5" rx="2" fill="none" stroke="${C.gold}" stroke-width="2.1"/>
      ${o.buttons ? `<circle cy="-176" r="1.7" fill="${C.gold}"/><circle cy="-165" r="1.7" fill="${C.gold}"/><circle cy="-60" r="1.7" fill="${C.gold}"/><circle cy="-44" r="1.7" fill="${C.gold}"/>` : ''}
      <path d="M-47,-22 Q0,-11 47,-22 L48,-12 Q0,0 -48,-12 Z" fill="${C.fur}"/>
      <path d="M-48,-14 Q0,-3 48,-14 L48,-12 Q0,0 -48,-12 Z" fill="${C.furShade}" opacity=".8"/>
      <!-- الذراعان والهدايا -->
      <path d="M-19.5,-188.5 C-28,-185 -31.5,-167 -30.5,-150 C-29.5,-137 -25,-125 -18.5,-115.5 L-12.5,-121 C-17.5,-129 -20.8,-140 -21,-152 C-21.2,-165 -19.5,-177 -15.5,-185 Z" fill="${o.sleeve}"/>
      <path d="M19.5,-188.5 C28,-185 31.5,-167 30.5,-150 C29.5,-137 25,-125 18.5,-115.5 L12.5,-121 C17.5,-129 20.8,-140 21,-152 C21.2,-165 19.5,-177 15.5,-185 Z" fill="${redDeep}"/>
      <path d="M-21,-152 C-20.8,-140 -17.5,-129 -12.5,-121 M21,-152 C20.8,-140 17.5,-129 12.5,-121" fill="none" stroke="#5E1A24" stroke-width=".9" opacity=".45"/>
      ${giftHeld}
      <ellipse cx="-16" cy="-118" rx="5.6" ry="4.2" transform="rotate(-42 -16 -118)" fill="${C.fur}"/>
      <ellipse cx="16" cy="-118" rx="5.6" ry="4.2" transform="rotate(42 16 -118)" fill="${C.fur}"/>
      <ellipse cx="-13" cy="-114.5" rx="4" ry="3.4" fill="${C.skin}"/><ellipse cx="13" cy="-114.5" rx="4" ry="3.4" fill="${C.skin}"/>
      <!-- الرقبة والياقة -->
      <rect x="-4.6" y="-200" width="9.2" height="12" rx="3" fill="${C.skinShade}"/>
      <ellipse cy="-189" rx="13.5" ry="5.8" fill="${C.fur}"/><ellipse cy="-187.6" rx="11.5" ry="3.2" fill="${C.furShade}" opacity=".7"/>
      <!-- الرأس -->
      <ellipse cy="-214" rx="21.6" ry="25.4" fill="${red}"/>
      <path d="M-22,-220 C-20,-236 -8,-242 4,-241 C-8,-236 -14,-228 -16,-214 Z" fill="#fff" opacity=".08"/>
      <ellipse cy="-213.4" rx="16.8" ry="20.3" fill="none" stroke="${C.fur}" stroke-width="5.2"/>
      <ellipse cy="-213.4" rx="19.1" ry="22.6" fill="none" stroke="${C.furShade}" stroke-width=".9" opacity=".9"/>
      <ellipse cy="-213.6" rx="14.9" ry="18.6" fill="#E7C1A6"/>
      <path d="${face}" fill="${C.skin}"/>
      <ellipse cy="-227.4" rx="9" ry="2.6" fill="${C.skinShade}" opacity=".22"/>
      <path d="M-7,-200 Q0,-196.4 7,-200 Q0,-197.8 -7,-200 Z" fill="${C.skinShade}" opacity=".5"/>
      <path d="M-9.4,-219.4 Q-6.2,-222.2 -2.4,-220.6 M2.4,-220.6 Q6.2,-222.2 9.4,-219.4" fill="none" stroke="#6E4C40" stroke-width="1.05" stroke-linecap="round"/>
      ${eye(-5)}${eye(5)}
      <path d="M.5,-211.2 q1.1,2.4 -.5,3.3" fill="none" stroke="#C99680" stroke-width=".8" stroke-linecap="round"/>
      <ellipse cx="-8.6" cy="-208.2" rx="3.2" ry="1.9" fill="#F0A0A6" opacity=".38"/><ellipse cx="8.6" cy="-208.2" rx="3.2" ry="1.9" fill="#F0A0A6" opacity=".38"/>
      <ellipse cx="-7.6" cy="-209.6" rx="1.2" ry=".6" fill="#fff" opacity=".35"/><ellipse cx="9.6" cy="-209.6" rx="1.2" ry=".6" fill="#fff" opacity=".35"/>
      <path d="M-4.1,-205.3 Q-2,-206.6 0,-205.6 Q2,-206.6 4.1,-205.3 Q2.3,-202.1 0,-201.8 Q-2.3,-202.1 -4.1,-205.3 Z" fill="${o.lipColor}"/>
      <path d="M-4.1,-205.2 Q0,-203.9 4.1,-205.2" fill="none" stroke="#9E4652" stroke-width=".6" stroke-linecap="round"/>
      <ellipse cx=".6" cy="-203.2" rx="1.4" ry=".5" fill="#fff" opacity=".3"/>

    </g>`;
  }

  function heroScene() {
    const W = 600, H = 420;
    // الزينة الضوئية في أعلى المشهد
    let garland = '', wire = '';
    const swags = [[-10, 22, 300, 22, 34], [300, 22, 610, 22, 34]];
    const bc = ['#FFE7B0', '#F7C3C9', '#FFF3DA', '#CFE7F2'];
    let bi = 0;
    for (const [x1, y1, x2, y2, sag] of swags) {
      const qx = (x1 + x2) / 2, qy = y1 + sag * 2;
      wire += `M${x1},${y1} Q${qx},${qy} ${x2},${y2} `;
      for (let i = 1; i < 10; i++) {
        const t = i / 10;
        const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * qx + t * t * x2;
        const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * qy + t * t * y2;
        garland += `<g class="hs-bulb" style="--d:${((bi * 0.37) % 2.4).toFixed(2)}s">${glow(x, y + 4, 9, .8)}<path d="M${f1(x - 1.4)},${f1(y)} h2.8 v2 h-2.8z" fill="#4A4A55"/><ellipse cx="${f1(x)}" cy="${f1(y + 4.6)}" rx="2.4" ry="3.3" fill="${bc[bi % 4]}"/></g>`;
        bi++;
      }
    }
    const stars = [[60, 70], [150, 50], [232, 92], [380, 64], [470, 108], [560, 74], [520, 150], [96, 140], [300, 120]]
      .map(([x, y], i) => `<circle class="hs-tw" style="--d:${(i * 0.53 % 3).toFixed(2)}s" cx="${x}" cy="${y}" r="${i % 3 ? 1 : 1.5}" fill="#F3EEDD"/>`).join('');

    const eiffel = `<g fill="#2F4A74">
      <path d="M199,120 h2 L204.5,166 L211,166 L211,171.5 L207,171.5 L214,206 L222,206 L222,212 L216,212 C221,248 227,276 234,300 L218,300 C214,285 208,275 200,273 C192,275 186,285 182,300 L166,300 C173,276 179,248 184,212 L178,212 L178,206 L186,206 L193,171.5 L189,171.5 L189,166 L195.5,166 Z"/>
      <rect x="199.2" y="108" width="1.6" height="13"/>
    </g>
    <path d="M186.5,212 L213.5,212 M190,190 L210,190" stroke="#3A5888" stroke-width="1"/>
    ${glow(200, 110, 6, .9)}`;
    const bigben = `<g fill="#2F4A74">
      <path d="M402,150 L414,108 L426,150 Z"/><rect x="413" y="98" width="2" height="12"/>
      <rect x="400" y="150" width="28" height="34" rx="1"/><rect x="403" y="184" width="22" height="120"/>
    </g><circle cx="414" cy="167" r="9" fill="#F4E3B8" opacity=".85"/><path d="M414,167 v-5.5 M414,167 h4" stroke="#2F4A74" stroke-width="1.3" stroke-linecap="round"/>`;

    const mama = woman({
      id: 'mama', x: 258, y: 380, s: 1, flip: true, red: '#B3343F', redDeep: '#8C2632', sleeve: '#A02E3A', faceW: 13.7,
      buttons: true, gifts: 'single', lipColor: '#CF6F7B',
    });
    const rawan = woman({
      id: 'rawan', x: 344, y: 380, s: 1.01, flip: false, red: '#BC3A46', redDeep: '#922A36', sleeve: '#A8323F', faceW: 13.5,
      buttons: false, gifts: 'stack', lipColor: '#D57683',
    });

    return `
<svg class="hero-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="رسم شتوي لماما وروان بمعطفَي سانتا تحملان الهدايا، بين شجرتي كريسماس مضاءتين، وخلفهما مبانٍ أوروبية وبرج إيفل وساعة بيغ بن">
  <defs>
    <radialGradient id="hs-glow"><stop offset="0" stop-color="${C.warm}" stop-opacity=".95"/><stop offset=".35" stop-color="${C.warm}" stop-opacity=".35"/><stop offset="1" stop-color="${C.warm}" stop-opacity="0"/></radialGradient>
    <radialGradient id="hs-moon"><stop offset="0" stop-color="#FFF6DE" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6DE" stop-opacity="0"/></radialGradient>
    <radialGradient id="hs-warmth" cx=".5" cy=".75" r=".6"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".22"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="hs-tree" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2D6A55"/><stop offset="1" stop-color="#173E33"/></linearGradient>
    <linearGradient id="hs-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AA3CC" stop-opacity=".9"/><stop offset=".45" stop-color="#58739F" stop-opacity=".7"/><stop offset="1" stop-color="#2A416B" stop-opacity="0"/></linearGradient>
  </defs>
  <circle cx="512" cy="92" r="60" fill="url(#hs-moon)"/><circle cx="512" cy="92" r="17" fill="#FBF2DA"/>
  ${stars}
  ${eiffel}${bigben}
  ${buildings()}
  <ellipse cx="300" cy="300" rx="260" ry="120" fill="url(#hs-warmth)"/>
  <path d="M0,370 Q80,352 170,362 T340,360 T520,356 T600,362 V420 H0 Z" fill="url(#hs-snow)"/>
  <path d="M0,374 Q120,364 250,372 T600,368 L600,376 Q480,370 250,380 T0,384 Z" fill="#C9D8EE" opacity=".35"/>
  ${tree(84, 378, 210, 118, 0)}
  ${tree(522, 378, 190, 108, 1)}
  ${gift(40, 352, 30, 22, '#F2C6D0', '#DB9DAD')}${gift(60, 362, 24, 14, '#CFE6F2', '#9DC6DA')}${gift(110, 358, 28, 18, '#DCD2F3', '#B4A6DE')}
  ${gift(470, 356, 30, 20, '#CBE7D8', '#9CC9B2')}${gift(536, 360, 26, 16, '#F2C6D0', '#DB9DAD')}
  ${mama}${rawan}
  <path d="${wire}" fill="none" stroke="#3A4560" stroke-width="1.2"/>
  ${garland}
</svg>`;
  }

  // ثلج ناعم متكرر
  function snowfall(host, count, opt) {
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    opt = opt || {};
    const dMin = opt.durMin || 10, dSpan = (opt.durMax || 22) - dMin;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      s.className = 'snowflake';
      const size = 2 + Math.random() * 3.4;
      const dur = dMin + Math.random() * dSpan;
      s.style.cssText = `inset-inline-start:${(Math.random() * 100).toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `animation-duration:${dur.toFixed(1)}s;animation-delay:${(-Math.random() * dur).toFixed(1)}s;opacity:${(0.35 + Math.random() * 0.5).toFixed(2)};--drift:${(Math.random() * 50 - 25).toFixed(0)}px${opt.fall ? ';--fall:' + opt.fall : ''}`;
      frag.appendChild(s);
    }
    host.appendChild(frag);
  }

  window.WishArt = { SPRITE, heroScene, snowfall };
})();
