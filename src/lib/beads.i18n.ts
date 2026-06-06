import type { Bead } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { BEAD_BY_SLUG } from "@/lib/beads";

/**
 * Chinese (简体) content for each stone, keyed by slug.
 * `displayName` is the stone's Chinese name shown as the title in zh mode.
 */
type ZhBead = {
  displayName: string;
  description: string;
  origin: string;
  age: string;
  energyAlignment: string;
};

export const BEAD_ZH: Record<string, ZhBead> = {
  "gold-sheen-obsidian": {
    displayName: "金曜石",
    description:
      "火山玻璃之上，浮动着一层流转的金色光晕。它属于那些向抱负前行、却不迷失自我的人——相传它能照见通往丰盛的真实路径，并消解疑虑的杂音。",
    origin: "墨西哥·哈利斯科——由冷却的火山熔流孕育",
    age: "约 1 万年 · 全新世火山玻璃",
    energyAlignment: "太阳轮 · 意志与丰盛之座",
  },
  "rutilated-quartz": {
    displayName: "钛晶",
    description:
      "清透的水晶之中，贯穿着一缕缕金色的金红石细丝，宛如被封存的日光。它是意念的增幅器，为佩戴者的追求注入动能，被珍视为「明照专注」之石。",
    origin: "巴西·米纳斯吉拉斯",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "顶轮 · 清明与金色驱力交织",
  },
  "nephrite-jade": {
    displayName: "和田玉",
    description:
      "东方的帝王之石，温润而内蕴光华。数千年来作为和合与静水流深之吉祥信物，玉贴肤而佩，以涵养心性、招引绵长的福泽。",
    origin: "中国·新疆和田",
    age: "约 2.5 亿年 · 古生代变质",
    energyAlignment: "心轮 · 平衡、慈悲与丰盛",
  },
  amethyst: {
    displayName: "紫水晶",
    description:
      "一抹凝于石中的紫色静谧。长久以来与沉思者相伴，紫水晶平息躁动的心绪，为佩戴者围拢起一圈守护的安宁——于静定之中抵达清明。",
    origin: "乌拉圭——深穴大教堂式晶洞",
    age: "约 1.3 亿年 · 白垩纪玄武岩",
    energyAlignment: "眉心轮 · 直觉与静观之智",
  },
  "clear-quartz": {
    displayName: "白水晶",
    description:
      "万晶之王——纯净、通透、无限受纳。它承接佩戴者的意念，再加倍回赠。是一张空白的乐谱，任何一种共振皆可在其上谱写。",
    origin: "美国·阿肯色州",
    age: "约 3 亿年 · 古生代",
    energyAlignment: "贯通诸轮 · 纯粹增幅",
  },
  "black-obsidian": {
    displayName: "黑曜石",
    description:
      "深渊之镜，被打磨成流动般的漆黑。守护之石——它静默地筑起一道抵御纷扰的屏障，一次又一次地将佩戴者带回坚实的大地。",
    origin: "亚美尼亚——更新世黑曜岩原",
    age: "约 200 万年 · 更新世火山玻璃",
    energyAlignment: "海底轮 · 扎根与化解恐惧",
  },
  citrine: {
    displayName: "黄水晶",
    description:
      "日光凝结而成的蜜色金黄。商贾之石，相传从不蓄留负面之气——它招引温暖、慷慨，以及财富在生命中的轻盈流转。",
    origin: "巴西·南里奥格兰德",
    age: "约 1.3 亿年 · 白垩纪玄武岩",
    energyAlignment: "太阳轮 · 璀璨的丰盛",
  },
  "smoky-quartz": {
    displayName: "茶晶",
    description:
      "浸润于柔和烟灰色深处的水晶。一枚修复之石，它带走一日的沉重，归还活力——在扎根的同时，不曾黯淡佩戴者的光。",
    origin: "苏格兰·凯恩戈姆山脉",
    age: "约 4 亿年 · 泥盆纪花岗岩",
    energyAlignment: "海底轮 · 焕新与稳健的活力",
  },
  "red-agate": {
    displayName: "红玛瑙",
    description:
      "浓郁深红的暖意之石——红玛瑙承载着活力与勇气的能量。作为抵御负能量的护盾，它坚固心志，在疑虑时刻重燃自信之光。",
    origin: "中国·云南",
    age: "约 1 亿年 · 白垩纪火山岩",
    energyAlignment: "海底轮 · 勇气与守护",
  },
  "black-hair-crystal": {
    displayName: "黑发晶",
    description:
      "清透的水晶与黑色电气石交织——既清明又护持。它净化能量场，同时安抚散乱的思绪，是守护与光明的双重馈赠。",
    origin: "巴西",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "海底轮与顶轮 · 净化清明",
  },
  "rose-quartz": {
    displayName: "粉水晶",
    description:
      "无条件之爱的象征——柔和的玫瑰色，温柔而宁静。它打开心扉，让给予与接受都同样自在，消融旧伤，为佩戴者的生命引入细腻的连结。",
    origin: "马达加斯加",
    age: "约 5.5 亿年 · 前寒武纪",
    energyAlignment: "心轮 · 爱与温柔疗愈",
  },
  "tiger-eye": {
    displayName: "虎眼石",
    description:
      "金色丝绢般的光芒在表面流转，宛如活焰——虎眼石兼具猎者的胆魄与观察者的耐心。专为以果敢行动追求丰盛者而生。",
    origin: "南非·北开普省",
    age: "约 26 亿年 · 太古宙条带状铁岩",
    energyAlignment: "太阳轮 · 果敢与丰盛",
  },
  "lapis-lazuli": {
    displayName: "青金石",
    description:
      "夜空压缩成石——深邃靛蓝之中，金色黄铁矿星点闪烁。数千年来被奉为智慧与真理之石，青金石开启心智，通达更高理解，赋予佩戴者言说真相的清明。",
    origin: "阿富汗·巴达赫尚",
    age: "约 6 亿年 · 前寒武纪大理岩",
    energyAlignment: "眉心轮与喉轮 · 智慧与真理",
  },
  "green-phantom": {
    displayName: "绿幽灵",
    description:
      "通透的白水晶之中，悬着一座绿色绿泥石的金字塔，宛如森林封存于玻璃。经典的「正财」之石——相传它招引稳健而诚实的财富，并赋予静待其生长的耐心。",
    origin: "巴西·米纳斯吉拉斯",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "心轮 · 财富的缓慢积累",
  },
  garnet: {
    displayName: "石榴石",
    description:
      "深酒红的晶体，带着握于掌心的炭火般的光。一枚循环与活力之石，石榴石被佩以温养身体的能量、恢复耐力，重燃对生活的渴望。",
    origin: "印度·拉贾斯坦",
    age: "约 10 亿年 · 元古宙片岩",
    energyAlignment: "海底轮 · 活力与血气之暖",
  },
  "red-rabbit-hair": {
    displayName: "红胶花",
    description:
      "清透的水晶之中，贯穿着纤细的赤红赤铁矿针，柔如纺线。一枚温柔而阴性的活力之石——相传它滋养气血、提振心绪，重现健康的红润光采。",
    origin: "巴西·米纳斯吉拉斯",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "脐轮 · 温暖、活力与焕新",
  },
  "black-gold-super-seven": {
    displayName: "黑金超七",
    description:
      "七种矿物融于一颗幽暗而泛金的石中。长久被奉为权威与动能的护符，它被佩以稳定野心、磨砺意志，载着佩戴者在事业中持续前行。",
    origin: "巴西·圣埃斯皮里图",
    age: "约 5 亿年 · 前寒武纪",
    energyAlignment: "海底轮与顶轮 · 沉稳而进取的攀升",
  },
  "green-rabbit-hair": {
    displayName: "绿兔毛",
    description:
      "清透的水晶中充盈着丝绢般的绿色阳起石纤维，宛如凝于冰中的草叶。一枚机遇与成长之石，相传它为事业开门，加速晋升之路。",
    origin: "巴西·米纳斯吉拉斯",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "心轮 · 动能与兴盛的事业",
  },
  moonstone: {
    displayName: "月光石",
    description:
      "乳白的石中，随转动浮起一抹蓝光，宛如月升于水面。佩之以求安宁与好眠，它抚平情绪的潮汐，为躁动的心带来歇息。",
    origin: "斯里兰卡",
    age: "约 5.5 亿年 · 前寒武纪片麻岩",
    energyAlignment: "顶轮 · 月之静与直觉",
  },
  prehnite: {
    displayName: "葡萄石",
    description:
      "半透的淡葡萄绿之石，莹润如初春。被誉为平静之石，它平息过度活跃的心智，引身体归于休憩，迎来无扰而修复的睡眠。",
    origin: "马里·卡耶斯",
    age: "约 2 亿年 · 中生代玄武岩",
    energyAlignment: "心轮 · 卸下重负、深度休息",
  },
  "grey-agate": {
    displayName: "灰玛瑙",
    description:
      "柔和的同心纹层，烟与灰的色调，清冷而从容。一枚接地与平衡之石，灰玛瑙安抚散乱的神经，将佩戴者引向缓慢、稳定而安歇的静定。",
    origin: "中国·内蒙古",
    age: "约 1 亿年 · 白垩纪火山岩",
    energyAlignment: "海底轮 · 静定与静默的平衡",
  },
  cinnabar: {
    displayName: "朱砂",
    description:
      "一抹鲜明而神圣的朱红，东方自古以之辟邪祈福。朱砂被佩为抵御厄运的守护者——一枚护持与平安之石，护佑佩戴者于每一段旅途。",
    origin: "中国·贵州",
    age: "约 6000 万年 · 新生代热液",
    energyAlignment: "海底轮 · 守护与吉祥之安",
  },
  kunzite: {
    displayName: "紫锂辉",
    description:
      "半透的晶体，自淡紫晕染至柔粉，自内透光。一枚温柔的宁静之石，紫锂辉消融焦虑，以护持而平和的暖意围拢佩戴者。",
    origin: "阿富汗·努里斯坦",
    age: "约 2500 万年 · 新生代伟晶岩",
    energyAlignment: "心轮 · 安宁与不设防的平静",
  },
  "strawberry-quartz": {
    displayName: "草莓晶",
    description:
      "玫粉的水晶缀着点点红色内含物，宛如夏果中的籽。一枚温暖而甜美的亲和之石，相传它点亮佩戴者的气场，招引善缘与轻盈的连结。",
    origin: "哈萨克斯坦",
    age: "约 5.4 亿年 · 前寒武纪",
    energyAlignment: "心轮 · 温暖、魅力与连结",
  },
  rhodochrosite: {
    displayName: "红纹石",
    description:
      "玫红与乳白的纹带在石上卷曲，宛如一场日出。慈悲之心的灵石，红纹石修补旧伤、安定情绪，敞开佩戴者，迎向温柔而慷慨的爱。",
    origin: "阿根廷·卡皮利塔斯",
    age: "约 1500 万年 · 新生代热液",
    energyAlignment: "心轮 · 情绪疗愈与默契",
  },
  "purple-hair-super-seven": {
    displayName: "紫发超七",
    description:
      "七种矿物交织于深紫的晶体之中，贯以纤细金红石丝。一枚气场与洞见之石，佩之以招引善缘，亦令求学之心保持清明、专注而富灵感。",
    origin: "巴西·圣埃斯皮里图",
    age: "约 5 亿年 · 前寒武纪",
    energyAlignment: "眉心轮 · 魅力与清明的专注",
  },
  "white-phantom": {
    displayName: "白幽晶",
    description:
      "清透的水晶中，封存着早先自我的苍白幽影。一枚净化而安定之石，相传它廓清情绪的迷雾，消解残留的不安，令佩戴者回归洁净而宁静的心。",
    origin: "巴西·米纳斯吉拉斯",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "顶轮 · 净化与情绪重置",
  },
  aquamarine: {
    displayName: "海蓝宝",
    description:
      "通透的晶体，浅海般的色泽，清冷而澄明。平静之水的灵石，海蓝宝安抚动荡的情绪，疏通表达，将佩戴者的心境引向宁然而平稳的潮汐。",
    origin: "巴西·米纳斯吉拉斯",
    age: "约 5 亿年 · 前寒武纪伟晶岩",
    energyAlignment: "喉轮 · 平静、清明的情感与言说",
  },
  "purple-chalcedony": {
    displayName: "紫玉髓",
    description:
      "温润而色调均匀的紫石，内蕴柔光。一枚静默聚焦之石，相传它平息纷乱的心思，锐化专注，支持学习中稳定而耐心的功夫。",
    origin: "印度尼西亚·苏拉威西",
    age: "约 2000 万年 · 新生代火山岩",
    energyAlignment: "眉心轮 · 专注与沉静的求学",
  },
};

/**
 * Longer editorial lore — geology, history and cultural use — keyed by slug.
 * Shown in the Stone Guide detail panel under "Lore & History".
 */
export const BEAD_LORE_EN: Record<string, string> = {
  "gold-sheen-obsidian":
    "Obsidian is a natural glass formed when silica-rich lava cools too fast for crystals to grow; the drifting golden sheen comes from microscopic gas bubbles trapped in flat, aligned layers that catch the light. The Aztecs carved it into blades and scrying mirrors, and it has long been carried as a stone for cutting through illusion and seeing one's path to abundance clearly.",
  "rutilated-quartz":
    "The golden threads are needles of rutile (titanium dioxide) that grew inside the quartz as it crystallised in granite pegmatites. Long nicknamed 'Venus hair' and 'arrows of love', it is treasured as a stone that amplifies intention and keeps momentum flowing toward one's goals.",
  "nephrite-jade":
    "Nephrite is an extraordinarily tough, interlocking mass of amphibole fibres — so resilient it was worked into tools and ritual blades across Neolithic China and Māori New Zealand. In Chinese culture jade (玉) embodies virtue, harmony and protection, and is traditionally worn against the skin so its coolness is said to absorb misfortune.",
  amethyst:
    "Amethyst is purple quartz coloured by trace iron and natural irradiation; the finest cathedral geodes grow inside ancient Brazilian and Uruguayan lava flows. The Greeks believed it guarded against drunkenness — its name means 'not intoxicated' — and it endures as a stone of clarity, sobriety and calm focus.",
  "clear-quartz":
    "Pure silicon dioxide, clear quartz is piezoelectric — it turns pressure into a tiny electric charge, which is why it once kept time in watches and radios. Cultures worldwide have called it the 'master stone', a blank crystal believed to hold and amplify whatever intention is set within it.",
  "black-obsidian":
    "Like its golden cousin, black obsidian is rapidly chilled volcanic glass; it fractures to an edge sharper than surgical steel and was knapped into humanity's earliest blades. It has long served as a scrying mirror and a grounding, protective stone that returns the wearer to solid ground.",
  citrine:
    "True citrine is rare golden quartz coloured by trace iron, though much on the market is heat-treated amethyst. Known for centuries as 'the merchant's stone', it is carried to invite warmth, generosity and the easy circulation of prosperity.",
  "smoky-quartz":
    "Smoky quartz takes its colour from natural radiation acting on traces of aluminium in the crystal; the Scottish Cairngorm variety is the national stone of Scotland and once adorned kilt pins and dirks. It is valued as a gently grounding stone that draws off heaviness and restores vitality.",
  "red-agate":
    "Agate is banded chalcedony — microcrystalline quartz that fills volcanic gas pockets layer by layer over millions of years. Used since antiquity for seals, amulets and beads, red agate (玛瑙) is worn for courage, vitality and steady protection.",
  "black-hair-crystal":
    "This is clear quartz that crystallised around fine black needles of tourmaline (schorl). Tourmaline is strongly pyroelectric, and the pairing is prized as a purifying, shielding stone that grounds scattered thoughts while keeping the mind clear.",
  "rose-quartz":
    "Rose quartz owes its blush to trace titanium, iron and manganese, and usually forms in massive veins within granite pegmatites rather than as crystals. Across cultures it is the quintessential stone of love — gentle, heart-opening and consoling.",
  "tiger-eye":
    "Tiger eye forms when quartz slowly replaces fibrous blue crocidolite, preserving the parallel fibres that produce its moving band of light (chatoyancy). Roman soldiers carried it into battle for courage, and it remains a stone of bold, decisive action.",
  "lapis-lazuli":
    "Lapis is a rock, not a single mineral — deep-blue lazurite flecked with gold pyrite and white calcite, mined in Afghanistan's Badakhshan mountains for over 6,000 years. Ground into the pigment ultramarine, it coloured Renaissance skies and Egyptian funerary masks, and has always signified wisdom and truth.",
  "green-phantom":
    "A 'phantom' appears when crystal growth pauses and a layer of green chlorite settles on the crystal face before quartz grows over it, sealing a ghostly inner outline. It is the classic Chinese stone of 正财 — wealth earned steadily and honestly through one's own effort.",
  garnet:
    "Garnets are a family of silicate minerals that crystallise under the heat and pressure of metamorphism; their clean, glassy crystals serve geologists as an index to how rocks have formed. A symbol of blood and the life-force, garnet has been worn since the Bronze Age for vitality, circulation and stamina.",
  "red-rabbit-hair":
    "The soft crimson 'hairs' are fine needles of hematite or rutile suspended within clear quartz. A gentle, feminine variety of hair-crystal, it is carried to nourish the blood, lift the spirits and restore a healthy glow.",
  "black-gold-super-seven":
    "Super Seven is a single stone that naturally contains seven minerals — amethyst, clear quartz, smoky quartz, cacoxenite, goethite, lepidocrocite and rutile — found almost exclusively in Espírito Santo, Brazil. The dark, gold-glinting variety is worn as a talisman of authority, momentum and grounded ambition.",
  "green-rabbit-hair":
    "Here the inclusions are silky green fibres of actinolite caught inside clear quartz as it grew. A stone of opportunity and growth, it is carried to open doors in one's work and quicken advancement.",
  moonstone:
    "Moonstone is a feldspar whose dreamy blue glow — adularescence — comes from light scattering between microscopic alternating layers of two feldspars. Sacred to lunar deities from India to Rome, it is worn for calm, intuition and gentle, restful dreaming.",
  prehnite:
    "Prehnite was the first mineral ever named after a person — Dutch colonel Hendrik von Prehn, who carried it from South Africa in the 1780s. Its soft, luminous grape-green is valued as a stone of peace that quiets an overactive mind and eases the body toward rest.",
  "grey-agate":
    "Like all agate, the grey variety is chalcedony banded in concentric layers within ancient volcanic cavities. Cool and unhurried, it is used as a grounding, balancing stone that settles a scattered nervous system into restful stillness.",
  cinnabar:
    "Cinnabar is mercury sulfide — the historic ore of mercury and the source of the brilliant red pigment vermilion used in Chinese lacquer and seals for millennia. Treated as sacred and protective, it is worn to ward off ill fortune; being soft and mercury-bearing, it is sealed and handled with care.",
  kunzite:
    "Kunzite is the pink-to-lilac variety of spodumene, named for the gemologist George Kunz who first described it in 1902; its colour can fade in strong sun, so it is sometimes called an 'evening stone'. It is cherished as a tender stone of serenity that dissolves anxiety.",
  "strawberry-quartz":
    "Rosy quartz freckled with red inclusions of hematite and iron oxide, resembling the seeds of summer fruit. A warm, sweet stone of affection, it is worn to brighten one's presence and draw kind company near.",
  rhodochrosite:
    "Rhodochrosite is manganese carbonate, banded in rose and cream as it forms in slow drips within mineral veins — Argentina's stalactite specimens are the most prized. The 'stone of the compassionate heart', it is worn to mend old hurt and open the wearer to generous love.",
  "purple-hair-super-seven":
    "A violet form of Super Seven, threaded with fine rutile needles among its seven minerals. A stone of presence and insight, it is worn to draw good company and keep the studying mind clear and inspired.",
  "white-phantom":
    "Pale inner 'phantoms' record pauses in the crystal's growth, when a film of white kaolinite or quartz dust settled before growth resumed. A purifying, settling stone, it is carried to clear emotional fog and return to a clean, quiet mind.",
  aquamarine:
    "Aquamarine is the sea-blue variety of beryl, coloured by trace iron and famously found as giant, flawless crystals in Brazilian pegmatites. Sailors once carried it as a talisman for safe passage, and it remains a stone of calm, clear feeling and communication.",
  "purple-chalcedony":
    "Chalcedony is quartz so finely crystalline it appears solid and waxy; the even violet variety takes its colour from trace elements. A quietly focusing stone, it is worn to calm a busy mind and support patient, sustained study.",
};

/** Chinese (简体) longer lore, keyed by slug. */
export const BEAD_LORE_ZH: Record<string, string> = {
  "gold-sheen-obsidian":
    "黑曜石是富硅熔岩急速冷却而成的天然玻璃，流转的金色光泽来自内部成层排列的微小气泡对光的反射。阿兹特克人曾以之制刃与占卜之镜，自古被视为斩断幻象、照见丰盛之路的灵石。",
  "rutilated-quartz":
    "金色的细丝是水晶在花岗伟晶岩中结晶时包裹进的金红石（二氧化钛）针。古称「维纳斯发丝」与「爱神之箭」，被珍视为放大意念、令动能不断涌向目标之石。",
  "nephrite-jade":
    "和田玉由极坚韧的闪石纤维交织而成，坚固到新石器时代即被制成工具与礼刃。在中华文化中，玉象征德性、和合与守护，传统上贴身佩戴，相传其温凉可「化煞挡灾」。",
  amethyst:
    "紫水晶是含微量铁、经天然辐射致色的紫色石英，上佳的「教堂式」晶洞生于古老的巴西与乌拉圭熔岩之中。希腊人认为它可防醉酒——其名意为「不醉」——历来是清明、自持与沉静专注之石。",
  "clear-quartz":
    "白水晶是纯净的二氧化硅，具压电性——受压会产生微弱电流，曾用于计时的钟表与收音机。世界各地都称之为「万晶之王」，相传能承载并放大所注入的意念。",
  "black-obsidian":
    "与金曜石同源，黑曜石是急速冷却的火山玻璃，断口锋利胜过手术钢，曾被打制成人类最早的刀刃。自古用作占卜之镜，亦为接地、护持、令人归于安稳之石。",
  citrine:
    "真正的黄水晶是含微量铁致色的金黄石英，市面上许多则为紫水晶加热而成。数百年来素有「商人之石」之称，被佩以招引温暖、慷慨与财富的流通。",
  "smoky-quartz":
    "茶晶的颜色来自天然辐射作用于晶体中的微量铝；苏格兰凯恩戈姆所产是苏格兰国石，曾用于裙别针与短剑。被视为温和接地、带走沉重、恢复活力之石。",
  "red-agate":
    "玛瑙是带状的玉髓——在火山气孔中历经百万年逐层沉积的微晶石英。自古用于印章、护符与珠饰，红玛瑙被佩以增添勇气、活力与稳定的守护。",
  "black-hair-crystal":
    "这是水晶围绕黑色电气石（黑碧玺）细针结晶而成。电气石具强热电性，二者结合被珍视为净化、护盾之石，既安定散乱思绪、又保持心神清明。",
  "rose-quartz":
    "粉水晶的柔粉来自微量钛、铁与锰，多以块状产于花岗伟晶岩脉中，少见晶形。在各种文化中都是爱之石的代表——温柔、开启心扉、抚慰人心。",
  "tiger-eye":
    "虎眼石形成于石英缓慢交代纤维状青石棉的过程，保留了平行纤维，造就流动的光带（猫眼效应）。罗马士兵曾带它上阵以壮胆，至今仍是果敢决断之石。",
  "lapis-lazuli":
    "青金石是岩石而非单一矿物——深蓝的青金石缀以金色黄铁矿与白色方解石，在阿富汗巴达赫尚开采已逾六千年。研磨成「群青」颜料，曾点染文艺复兴的天空与古埃及金面具，历来象征智慧与真理。",
  "green-phantom":
    "「幽灵」形成于晶体生长暂停、绿色绿泥石落于晶面、其后水晶再覆盖生长，封存出幽影般的轮廓。它是中国经典的「正财」之石——以自身努力稳健而正当地积累财富。",
  garnet:
    "石榴石是一族硅酸盐矿物，于变质作用的高温高压下结晶，其规整而具玻璃光泽的晶体是地质学家判读岩石成因的指标。象征血液与生命力，自青铜时代起即被佩以增益活力、循环与耐力。",
  "red-rabbit-hair":
    "柔和的赤红「毛发」是悬于白水晶中的赤铁矿或金红石细针。它是发晶中温柔而阴性的一支，被佩以养气血、振心绪、重现红润光采。",
  "black-gold-super-seven":
    "超七是单一石中天然共生七种矿物——紫水晶、白水晶、茶晶、针铁矿、纤铁矿、镉黄长石与金红石，几乎只产于巴西圣埃斯皮里图州。黑金色一支被佩为权威、动能与沉稳野心的护符。",
  "green-rabbit-hair":
    "此处的内含物是封于白水晶中丝绢状的绿色阳起石纤维。作为机遇与成长之石，被佩以为事业开门、加速晋升。",
  moonstone:
    "月光石是一种长石，其梦幻蓝光（晕彩）来自光在两种长石微观交替薄层间的散射。自印度至罗马都奉为月神圣石，被佩以求安宁、直觉与温柔好眠。",
  prehnite:
    "葡萄石是史上第一种以人名命名的矿物——荷兰上校冯·普伦于十八世纪八十年代自南非带回。其柔润的葡萄绿被视为平静之石，平息躁动心智、引身体归于休憩。",
  "grey-agate":
    "与所有玛瑙一样，灰玛瑙是在古老火山腔体中逐层沉积、呈同心纹带的玉髓。清冷而从容，被用作接地、平衡之石，将散乱的神经安抚为安歇的静定。",
  cinnabar:
    "朱砂为硫化汞——历史上汞的主要矿石，也是中国漆器与印泥所用鲜红「朱色」颜料的来源，沿用数千年。视为神圣而护持，被佩以辟除厄运；因其质软且含汞，须封装并谨慎佩用。",
  kunzite:
    "紫锂辉是锂辉石中粉至淡紫的一支，得名于 1902 年最早描述它的宝石学家昆兹；其色在强光下会褪，故有「夜之石」之称。被珍视为消融焦虑的温柔宁静之石。",
  "strawberry-quartz":
    "玫粉的水晶缀以赤铁矿与氧化铁的红色内含物，宛如夏果之籽。一枚温暖而甜美的亲和之石，被佩以点亮气场、招引善缘。",
  rhodochrosite:
    "红纹石是碳酸锰，在矿脉中缓慢滴积而成玫红与乳白的纹带——阿根廷的钟乳状标本最为珍贵。素称「慈悲之心石」，被佩以修补旧伤、敞开心扉迎向慷慨之爱。",
  "purple-hair-super-seven":
    "超七的紫色一支，于七种共生矿物间贯以纤细金红石针。一枚气场与洞见之石，被佩以招引善缘、令求学之心清明而富灵感。",
  "white-phantom":
    "苍白的内「幽影」记录了晶体生长的暂停——一层白色高岭石或石英尘落定，其后再生长。一枚净化而安定之石，被佩以廓清情绪迷雾、回归洁净宁静之心。",
  aquamarine:
    "海蓝宝是绿柱石中海蓝色的一支，由微量铁致色，巴西伟晶岩中曾产出巨大而无瑕的晶体。水手曾以之为平安渡海的护符，至今仍是平静、澄澈情感与沟通之石。",
  "purple-chalcedony":
    "玉髓是晶粒极细、看似致密温润的石英；均匀的紫色源自微量元素。一枚静默聚焦之石，被佩以平息纷乱心思、支持耐心而持续的学习。",
};

export type LocalizedBead = {
  title: string;
  /** Secondary line (the other language's name). */
  sub: string;
  description: string;
  /** Longer geology / history / culture lore. */
  loreLong: string;
  origin: string;
  age: string;
  energyAlignment: string;
};

/** Produce the locale-appropriate display strings for a stone. */
export function localizeBead(bead: Bead, locale: Locale): LocalizedBead {
  if (locale === "zh") {
    const z = BEAD_ZH[bead.slug];
    if (z) {
      return {
        title: z.displayName,
        sub: bead.westernName,
        description: z.description,
        loreLong: BEAD_LORE_ZH[bead.slug] ?? BEAD_LORE_EN[bead.slug] ?? "",
        origin: z.origin,
        age: z.age,
        energyAlignment: z.energyAlignment,
      };
    }
  }
  return {
    title: bead.westernName,
    sub: bead.name,
    description: bead.description,
    loreLong: BEAD_LORE_EN[bead.slug] ?? "",
    origin: bead.origin,
    age: bead.age,
    energyAlignment: bead.energyAlignment,
  };
}

/** Convenience: localize by slug (used where only the slug is on hand). */
export function localizeSlug(
  slug: string,
  locale: Locale,
): LocalizedBead | null {
  const bead = BEAD_BY_SLUG[slug];
  return bead ? localizeBead(bead, locale) : null;
}
