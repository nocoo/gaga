import * as THREE from 'three';
import { seededRandom } from './palette';

const cache = new Map<string, THREE.CanvasTexture>();

function canvasTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const existing = cache.get(key);
  if (existing) return existing;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}

export function surfaceTexture(kind: 'wood' | 'fabric' | 'plaster' | 'foam', color: string) {
  return canvasTexture(`${kind}-${color}`, 256, (ctx, s) => {
    const random = seededRandom(63);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, s, s);
    const amount = kind === 'fabric' ? 10000 : 6500;
    for (let i = 0; i < amount; i++) {
      const light = random() > 0.5;
      ctx.fillStyle = light ? `rgba(255,255,242,${random() * 0.095})` : `rgba(79,58,37,${random() * 0.055})`;
      const x = random() * s, y = random() * s;
      ctx.fillRect(x, y, kind === 'wood' ? 0.6 : 1, kind === 'wood' ? random() * 20 : 1);
    }
    if (kind === 'wood') {
      for (let i = 0; i < 45; i++) {
        const x = random() * s;
        ctx.strokeStyle = `rgba(114,77,34,${0.025 + random() * 0.045})`;
        ctx.lineWidth = random() * 1.3 + 0.4;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + random() * 16, 80, x - random() * 15, 170, x, 256);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,245,202,0.06)';
      for (let y = 0; y < s; y += 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke();
      }
    }
    if (kind === 'fabric') {
      for (let i = 0; i < s; i += 3) {
        ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.fillRect(i, 0, 1, s);
        ctx.fillStyle = 'rgba(68,54,35,.035)'; ctx.fillRect(0, i, s, 1);
      }
    }
  });
}

export function artTexture(kind: 'bunny' | 'sun' | 'alphabet' | 'bear' | 'garden') {
  return canvasTexture(`art-${kind}`, 512, (ctx, s) => {
    ctx.fillStyle = '#f7edd4'; ctx.fillRect(0, 0, s, s);
    const random = seededRandom(7);
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = 'rgba(128,100,65,.035)'; ctx.fillRect(random() * s, random() * s, 1, 1);
    }
    const ellipse = (x: number, y: number, rx: number, ry: number, color: string) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    };
    if (kind === 'bunny') {
      ellipse(256, 310, 114, 110, '#cbb795');
      ellipse(196, 171, 36, 100, '#cbb795'); ellipse(305, 167, 36, 102, '#cbb795');
      ellipse(196, 165, 17, 67, '#e0b8a6'); ellipse(305, 162, 17, 67, '#e0b8a6');
      ellipse(218, 297, 8, 10, '#4e4a3a'); ellipse(292, 297, 8, 10, '#4e4a3a');
      ellipse(256, 328, 9, 7, '#9e755f');
      ellipse(197, 327, 20, 12, '#deb09b'); ellipse(312, 327, 20, 12, '#deb09b');
    } else if (kind === 'sun') {
      ctx.strokeStyle = '#d5a85b'; ctx.lineCap = 'round'; ctx.lineWidth = 12;
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(256 + Math.cos(a) * 122, 235 + Math.sin(a) * 122);
        ctx.lineTo(256 + Math.cos(a) * 155, 235 + Math.sin(a) * 155); ctx.stroke();
      }
      ellipse(256, 235, 98, 98, '#e3bd73');
      ellipse(228, 229, 6, 8, '#786649'); ellipse(286, 229, 6, 8, '#786649');
      ctx.beginPath(); ctx.arc(256, 247, 20, .2, Math.PI - .2); ctx.strokeStyle = '#aa8051'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#9a9278'; ctx.textAlign = 'center'; ctx.font = '24px Georgia'; ctx.fillText('hello, little sunshine', 256, 450);
    } else if (kind === 'alphabet') {
      ctx.textAlign = 'center'; ctx.font = 'bold 150px Georgia';
      ['A', 'B', 'C'].forEach((letter, i) => {
        ctx.fillStyle = ['#9da983', '#d78d71', '#dcbf79'][i]; ctx.fillText(letter, 115 + i * 140, 265 + (i % 2) * 45);
      });
      ctx.fillStyle = '#9a9278'; ctx.font = '22px Georgia'; ctx.fillText('a little more curious, every day', 256, 420);
    } else if (kind === 'bear') {
      ellipse(158, 174, 52, 52, '#bc8e63'); ellipse(353, 174, 52, 52, '#bc8e63');
      ellipse(256, 280, 140, 133, '#c49b72'); ellipse(256, 329, 65, 46, '#e7cca3');
      ellipse(207, 267, 9, 11, '#544439'); ellipse(302, 267, 9, 11, '#544439');
      ellipse(256, 309, 20, 13, '#6b503e');
    } else {
      ctx.fillStyle = '#b3bd96'; ctx.beginPath(); ctx.arc(170, 450, 215, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#879a78'; ctx.beginPath(); ctx.arc(420, 480, 260, Math.PI, 0); ctx.fill();
      ellipse(360, 110, 52, 52, '#e5bf77');
      for (let i = 0; i < 7; i++) {
        const x = 50 + i * 65, y = 280 + Math.sin(i * 2) * 70;
        ctx.strokeStyle = '#687f5f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y + 70); ctx.lineTo(x, y); ctx.stroke();
        for (let j = 0; j < 5; j++) ellipse(x + Math.cos(j / 5 * Math.PI * 2) * 13, y + Math.sin(j / 5 * Math.PI * 2) * 13, 12, 12, '#f6e2b6');
        ellipse(x, y, 8, 8, '#d6a65c');
      }
    }
  });
}

export function skyTexture(night = false) {
  return canvasTexture(`sky-${night}`, 512, (ctx, s) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, s);
    gradient.addColorStop(0, night ? '#34485c' : '#b9d4d2');
    gradient.addColorStop(1, night ? '#738782' : '#e9e9cf');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = night ? '#f5e2b4' : '#fff2c5'; ctx.beginPath(); ctx.arc(368, 117, night ? 30 : 39, 0, Math.PI * 2); ctx.fill();
    if (night) {
      const random = seededRandom(20);
      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = `rgba(255,239,199,${random() * .65 + .2})`; ctx.beginPath(); ctx.arc(random() * s, random() * 320, random() * 1.7 + .7, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.fillStyle = '#f4f3df';
      [[112, 123, 69], [295, 216, 45]].forEach(([x, y, r]) => {
        ctx.beginPath(); ctx.ellipse(x, y, r, r * .23, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x - 14, y - 9, r * .4, r * .3, 0, 0, Math.PI * 2); ctx.fill();
      });
    }
    [['#b4c5a2', '#506b64'], ['#92ad8b', '#455e56'], ['#738e71', '#344d48']].forEach((pair, i) => {
      ctx.fillStyle = pair[night ? 1 : 0]; ctx.beginPath(); ctx.moveTo(0, 512);
      ctx.lineTo(0, 360 + i * 45);
      ctx.bezierCurveTo(160, 220 + i * 90, 290, 460 - i * 50, 512, 310 + i * 55);
      ctx.lineTo(512, 512); ctx.fill();
    });
    // A tiny distant house makes the window feel like a view, not a flat color.
    ctx.fillStyle = night ? '#b9a582' : '#e9dfbd'; ctx.fillRect(106, 359, 35, 30);
    ctx.fillStyle = '#ac846b'; ctx.beginPath(); ctx.moveTo(101, 360); ctx.lineTo(124, 341); ctx.lineTo(146, 360); ctx.fill();
    ctx.fillStyle = night ? '#f8cc7d' : '#6f8a7a'; ctx.fillRect(119, 370, 9, 12);
  });
}

export function labelTexture(text: string, color = '#796746', background = '#ecd6ae') {
  return canvasTexture(`label-${text}-${color}-${background}`, 256, (ctx, s) => {
    ctx.fillStyle = background; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `600 ${text.length > 3 ? 38 : 112}px Georgia, serif`;
    ctx.fillText(text, 128, 134);
  });
}

export function shadowTexture() {
  return canvasTexture('shadow', 128, (ctx, s) => {
    const gradient = ctx.createRadialGradient(s / 2, s / 2, 8, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, 'rgba(57,45,28,.32)'); gradient.addColorStop(.5, 'rgba(57,45,28,.13)'); gradient.addColorStop(1, 'rgba(57,45,28,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, s, s);
  });
}

export function disposeTextures() { cache.forEach(t => t.dispose()); cache.clear(); }
