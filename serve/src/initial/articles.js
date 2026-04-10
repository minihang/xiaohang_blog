/** 与侧栏 `SideNavBar` 一致：ALL=全部；其余为 category 筛选 */
export const ARTICLE_CATEGORIES = ['随笔', '科研', '开发']

const IMG = {
  a: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeRAMTzAqCb_TyOFpZHn0IG8ul75F7H4HTLAeOdXsm-lqBIKeW37_infNcjD9VRB11ak6ZC8zzmOxvBJ9Rok1GrWQuMzPczjSTd1AvsFGPwJag8blntOqsOMrxWAG898_fc_l3Uxi8eARkweAe2lq2LOpFmCL-WSgdTFv1rkqqXCAzhJq919h-We_Voh_yI2AfAg-lFYebFCPvcHkSkRT6S4k3J3hla3A62PpULBw1H00sRsf5FMPPQqfBhZ6BJGEF0GfGxv_l4vQ',
  b: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgT14nq8yJQ4DrPwDFTsg8Ai9lhY772WZbqdXwHijYR3GzT-02H2HqJjYPl_ONQu8nTCyJHWtRzy7qrw4ivBvfPrHFoQ4sP3sjX1_tPPYEvnjqSEakGWEPJWvPpDfIV7RRspmhD93T_mlTtcOHVp4DkxTcIB8eAJ_2gbrf-AeTK5L8QTKPr2p6JPH2gQUNWwaedRGRN0eBOn6ef42PBf9G7XptwyqI8EF-5cf_aoTQh7GSF8dfYmqlUTGD1ovKrPIL8uPQmh8mPVc',
  c: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5ugOjJ--xaCGF2ZE2eH-XXM-F6di8U0aEzYFdcS8V5M7nZN1-xj27rx1KQRJmFcCxP1wOL4pXkojX3owLdj__dE8nzQAD_hH0nojhcLXLZrDrHyY5gTfWsdr-3L1lV-ccrQJunxY1XLEH6MnF-YUlXrWju8aOyytFInNKhNhN7WGCsQx0sTLuVSGqef5SD-a7deG65E1MuqwHoBzXygMfrEw0tFxg-6F8NjANl6pukh1d6zOJ07fgcWCl4iqy7OzATLNpvYw_uNg',
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2eEPMjYFzJZCWIzoiQh3p0PngiWfaMFJlXh9RIh0bghA1GLhSIsw84IAWutwMbyn8pjTAe94xa0MLuaDVc83g47TqjN73ZbqS4Sb81V_MuO8f8X0gJHTOhQ5lh3tnDIwskekoON-5bDjaKq4gEPSDF7Qmaqzl4w34tlM8pI-27B1jMdqnInGv4mjTHwXvs6Mv86HK4F64g5zq4nhkDiKKbF9VmffZjBffixN1T6Zt2L_3o0pgY1JLPtM5O3Mv-_6J8NpxiLuaXKM',
  av: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFLrYvOvlm4Te14qg6_Cm7DrcvS9gkZ4u4nRGt5qHAnOOSvy9LYnsC2YSdtG2LanKO74dsRd3lR_vpuK2xjKh-1o6FVWq5IEjA8YIltyqqICm1U7F63DxbOKu3qUW4u-dcTOnNghyN4DTmIEU5i9_IAaO2JI7cUiLVQPcbLfyUpir6gB4xSHfW6P-x1D7LETWf1jB2M4kBqzzFiDV1zl3nm1jbb4FyBv9dHUE6P9vBlJaCZySSwdIJceugSr1QIanF8IOm_wijnig',
  imgBody:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDw9DmboW4eFHqtZLNNSrjUxOT5BTO1PndnP2jPANrqu5NJSaK6Zk_pmzaz7gRmzFy9qPyblnLJd3avouAxjbQNYAS6geTLeZN3bXEhIuMWuE3ny1TsXrM3muEOVdR9WMKkeCebE4ZPlI7oBMQN85WqqxBrZclCXtGY7CYeik1178uvT6jnrGtGTjj5MbQpM2an4f7OTVMD1ytA8Kw-yE7ZLwkwFe1uTwMcSHSkZU5PXSHHXFQPSPMPGbH-I-VZBkOLCYi4yWXkfjE',
}

export const articles = [
  {
    id: 1,
    category: '开发',
    visibility: 'public',
    imageUrl: IMG.a,
    date: '2024.05.20',
    title: '响应式设计的核心哲学：从流动性到适应性',
    excerpt: '探讨在多设备时代，如何通过容器查询和现代 CSS 特性构建真正具有生命力的用户界面布局。',
    heroImage: IMG.hero,
    readTime: '12 分钟',
    authorName: 'Azure Curator',
    authorPublished: '发布于 2024年5月20日',
    authorAvatar: IMG.av,
    blocks: [
      {
        type: 'lead',
        text: '在这个信息爆炸的时代，我们的注意力被无数碎片化的通知和算法精心编织的推荐所瓜分。作为一名数字策展人，我一直在思考，如何才能在这样清脆而嘈杂的数字背景音中，寻找那一抹如清风般自在的宁静。',
      },
      { type: 'h2', bar: 'primary', text: '极简主义的数字重构' },
      {
        type: 'p',
        text: '我们习惯了“增加”——增加关注、增加应用、增加设备。然而，真正的自由往往来源于“剔除”。通过对我们日常接触的信息流进行一次彻底的审计，你会发现，超过 80% 的信息其实对你的成长和幸福毫无裨益。',
      },
      {
        type: 'code',
        title: '一个容器查询的最小示例',
        lang: 'css',
        code: `/* 让卡片容器成为 query container */
.card {
  container-type: inline-size;
  container-name: card;
}

/* 当卡片容器宽度 >= 520px 时，切成两列布局 */
@container card (min-width: 520px) {
  .card__body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}`,
      },
      {
        type: 'quote',
        text: '“美感并非堆砌的结果，而是当所有多余之物被剥离后，留下的那份最纯粹的本质。”',
      },
      {
        type: 'p',
        text: '蔚蓝清风的设计系统正源于此。它不依赖厚重的阴影或生硬的线条，而是通过光影、留白与柔和的色彩过渡，模拟自然界中空气与水的流动感。当我们身处这样的视觉环境中，心率会不自觉地放缓，大脑也会进入一种更为深度、专注的阅读状态。',
      },
      {
        type: 'code',
        title: '示例：容器查询让布局“自适应容器”',
        lang: 'CSS',
        code: `/* 当卡片容器宽度 >= 560px 时切换为两列布局 */
.card {
  container-type: inline-size;
}

.card__body {
  display: grid;
  gap: 16px;
}

@container (min-width: 560px) {
  .card__body {
    grid-template-columns: 1fr 240px;
    align-items: start;
  }
}`,
      },
      { type: 'h2', bar: 'tertiary', text: '建立你的呼吸空间' },
      {
        type: 'p',
        text: '无论是在现实生活中，还是在屏幕后的数字空间，我们都需要一个可以“呼吸”的容器。这不仅意味着物理上的空旷，更意味着心理上的从容。在这篇文章中，我想分享三个实用的技巧，帮助你重建这种秩序感：',
      },
      {
        type: 'checklist',
        items: [
          ['视觉去噪：', '关闭非必要应用的横幅通知，让屏幕回归纯净。'],
          ['定期离线：', '每天设置一小时的“无电模式”，去感受真实的微风。'],
          ['高质量输入：', '像策划一场展览一样挑选你的阅读列表。'],
        ],
      },
      { type: 'img', src: IMG.imgBody },
      {
        type: 'p',
        text: '最后，不要忘记保持那份最宝贵的好奇。好奇心是推动我们不断探索的动力，而热爱则是支撑我们在这条路上走得更远的灯塔。蔚蓝清风不仅是一个视觉系统，更是一种对待生活的态度：轻盈、通透、且永远向前。',
      },
    ],
  },
  {
    id: 2,
    category: '随笔',
    visibility: 'login',
    imageUrl: IMG.b,
    date: '2024.05.15',
    title: '在算法时代寻找“慢思考”的避风港',
    excerpt: '面对信息的洪流，我们如何刻意练习深度阅读与系统思考，重拾对知识的敬畏之心。',
    heroImage: IMG.b,
    readTime: '8 分钟',
    authorName: 'Azure Curator',
    authorPublished: '发布于 2024年5月15日',
    authorAvatar: IMG.av,
    blocks: [
      {
        type: 'lead',
        text: '这是一篇仅登录用户可阅读全文的示例文章。未登录访客在列表中仍能看到标题与摘要，进入详情后正文区域将提示无权访问。',
      },
      {
        type: 'p',
        text: '当你已登录（游客用户或管理员）后，即可阅读此处完整内容。深度阅读需要刻意练习：减少算法投喂、固定阅读时段、做笔记与复述。',
      },
      { type: 'p', text: '慢思考不是反对技术，而是为注意力保留主权。' },
    ],
  },
  {
    id: 3,
    category: '开发',
    visibility: 'admin',
    imageUrl: IMG.c,
    date: '2024.04.28',
    title: '个人博客系统 v2.0 架构重构路线图',
    excerpt: '内部文档：关于后端向 Serverless 迁移以及前端引入新的设计系统的技术选型分析。',
    heroImage: IMG.c,
    readTime: '15 分钟',
    authorName: 'Azure Curator',
    authorPublished: '发布于 2024年4月28日',
    authorAvatar: IMG.av,
    blocks: [
      {
        type: 'lead',
        text: '本文为管理员可见的内部路线图示例。非管理员用户进入后仅见标题与封面，正文区域无权访问。',
      },
      {
        type: 'p',
        text: '阶段一：后端 API 迁移至 Serverless；阶段二：前端引入统一设计系统与权限模型；阶段三：留言与文章审核工作流。',
      },
      { type: 'p', text: '具体排期与风险项请在管理会议中确认。' },
    ],
  },
  {
    id: 4,
    category: '随笔',
    visibility: 'public',
    imageUrl: IMG.b,
    date: '2024.06.01',
    title: '雨季与备忘录：把情绪写进空白行',
    excerpt: '不必每天都深刻，但值得为心事留一页只给自己看的纸。',
    heroImage: IMG.b,
    readTime: '5 分钟',
    authorName: 'Xiaohang',
    authorPublished: '发布于 2024年6月1日',
    authorAvatar: IMG.av,
    blocks: [
      { type: 'lead', text: '随笔的意义，在于允许句子不完整、结论不漂亮。' },
      { type: 'p', text: '雨季适合整理房间，也适合整理句子。把模糊的感受写下来，本身就是一种澄清。' },
    ],
  },
  {
    id: 5,
    category: '科研',
    visibility: 'public',
    imageUrl: IMG.a,
    date: '2024.06.10',
    title: '文献综述怎么写才不变成“摘抄拼图”',
    excerpt: '用问题链串起论文，而不是用关键词堆叠段落。',
    heroImage: IMG.a,
    readTime: '10 分钟',
    authorName: 'Xiaohang',
    authorPublished: '发布于 2024年6月10日',
    authorAvatar: IMG.av,
    blocks: [
      { type: 'lead', text: '综述的价值在于“地图”，而不是“目录”。' },
      {
        type: 'p',
        text: '先写研究问题，再选代表性工作，最后讨论分歧与空白。读者跟着你的问题走，就不会迷失在引用里。',
      },
    ],
  },
  {
    id: 6,
    category: '开发',
    visibility: 'public',
    imageUrl: IMG.c,
    date: '2024.06.12',
    title: 'Vite 里按需加载与代码分割的三个实用姿势',
    excerpt: '从动态 import 到路由级分包，让首屏再轻一点。',
    heroImage: IMG.c,
    readTime: '7 分钟',
    authorName: 'Xiaohang',
    authorPublished: '发布于 2024年6月12日',
    authorAvatar: IMG.av,
    blocks: [
      { type: 'lead', text: '性能优化不必一次做完，先量再切。' },
      { type: 'p', text: '路由懒加载、组件异步、第三方库拆分，是最常见也最有效的组合拳。' },
    ],
  },
  {
    id: 7,
    category: '科研',
    visibility: 'login',
    imageUrl: IMG.a,
    date: '2024.06.15',
    title: '实验记录：可复现性从命名规范开始',
    excerpt: '同一套数据，不同命名会让三个月后的自己也不认得。',
    heroImage: IMG.a,
    readTime: '6 分钟',
    authorName: 'Xiaohang',
    authorPublished: '发布于 2024年6月15日',
    authorAvatar: IMG.av,
    blocks: [
      { type: 'lead', text: '可复现不是道德口号，是工程习惯。' },
      { type: 'p', text: '固定目录结构、版本号、随机种子与依赖锁定文件，写进 README 的一小段就能救未来的你。' },
    ],
  },
  {
    id: 8,
    category: '随笔',
    visibility: 'public',
    imageUrl: IMG.b,
    date: '2024.06.18',
    title: '周末散步时想到的三个产品设计隐喻',
    excerpt: '路牌、长椅与岔路口——用户路径里也有同样的东西。',
    heroImage: IMG.b,
    readTime: '4 分钟',
    authorName: 'Xiaohang',
    authorPublished: '发布于 2024年6月18日',
    authorAvatar: IMG.av,
    blocks: [
      { type: 'p', text: '好界面像好公园：方向清楚、休息点合理、意外有退路。' },
    ],
  },
]

/** 文章列表与详情由后端 `/api/articles` 提供；本文件仅保留种子数据供 `serve` 首次同步数据库。 */
