<p align="center">
  <img src="assets/brand/icon-rounded.png" alt="Gaga" width="128" height="128" />
</p>

<h1 align="center">Gaga</h1>

<p align="center">
  <strong>陶陶的小小世界</strong><br>
  探索 · 玩具 · 3D 玩耍空间
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-0.180-000000?logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

<p align="center">
  <a href="https://gaga.hexly.ai"><img src="preview.jpg" width="720" alt="Gaga — 陶陶的小小世界" /></a>
</p>

---

## 这是什么

Gaga 是一个可以自由探索的网页 3D 玩耍空间。陶陶会自己选玩具、绕开障碍、走到互动位置，再做对应动作。不依赖前端框架，也不拉取远程模型。

**核心思路**：房间、角色、玩具和音效都在本地生成，打开页面就能玩。

线上：https://gaga.hexly.ai

## 功能

- **开放房间** — 约 60 ㎡ 拼接爬爬垫，原创圆润微缩家具与日夜灯光
- **8 类玩具** — 积木、绘本、轨道火车、布球、城堡爬架、木马、木琴、套圈
- **自主探索** — A* 寻路、互动排队；城堡可攀爬、走绳网、滑滑梯
- **本地足迹** — 当天探索记录存在 `localStorage`，可选轻音乐与木琴音效（默认静音）

## 操作

| 操作 | 效果 |
| --- | --- |
| 拖动画面 / 单指拖动 | 旋转视角；背面的墙会自动隐藏 |
| 滚轮 / 双指捏合 / `+` `−` | 放大、缩小 |
| 点击玩具 / 玩具百宝箱 | 引导陶陶去玩 |
| 点击陶陶头像 | 近距离跟随，再点一次返回全景 |
| `Space` | 暂停或继续 |
| `R` | 恢复初始视角 |
| `T` | 打开玩具百宝箱 |
| `M` | 开关环境音乐 |
| `N` | 切换昼夜 |

在城堡上或骑木马时选择下一件玩具，会先完成当前互动、回到地面，再出发。系统设置为「减少动态效果」时，初始为暂停状态。

## 项目结构

```text
src/
  main.ts                 # 启动、错误处理、HMR 生命周期
  style.css               # 界面、响应式、昼夜
  world/
    Playroom.ts           # 渲染、相机、拾取、灯光
    room.ts               # 房间与静态家具
    toys/                 # 8 类玩具模型与注册表
    navigation.ts         # A* 寻路
  character/
    Taotao.ts             # 角色建模与关节
    Explorer.ts           # 自主选择、步行、互动
    actions.ts            # 互动动作片段
  audio/Soundscape.ts     # 本地合成的轻音乐和玩具音效
  ui/AppUI.ts             # 控件、状态和探索足迹
scripts/
  smoke.mjs               # 桌面和触摸设备的浏览器检查
```

## 技术栈

| 层 | 技术 |
| --- | --- |
| 语言 | [TypeScript](https://www.typescriptlang.org/) |
| 渲染 | [Three.js](https://threejs.org/) |
| 构建 | [Vite 7](https://vite.dev/) |
| 发布 | [Cloudflare Workers](https://developers.cloudflare.com/workers/) 静态资源 |

模型、贴图、插画和字体均在本地提供或生成。需要支持 WebGL 2 的现代浏览器。场景、角色与绘本插画为原创程序化素材。DM Sans 字体使用 SIL Open Font License，见 `public/fonts/OFL.txt`。

## 开发

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev         # 默认 http://localhost:5177
npm run typecheck
npm run build
npm run preview     # 默认端口 4177
npm run test:e2e
npm run deploy      # 构建并发布到 gaga.hexly.ai
```

浏览器检查优先使用本机 Chrome。没有 Chrome 时先运行 `npx playwright install chromium`。检查截图放在 `artifacts/`。

开发模式提供 `window.__TAOTAO__` 诊断接口，生产构建中不会出现。

## 测试

| 层 | 内容 | 触发时机 |
| --- | --- | --- |
| 浏览器 | 玩具路线、动作、攀爬、拾取、暂停、相机、昼夜、声音、足迹、HMR、触屏 | `npm run test:e2e` |

## License

[MIT](LICENSE) © 2026
