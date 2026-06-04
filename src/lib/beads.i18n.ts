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
  energyAlignment: string;
};

export const BEAD_ZH: Record<string, ZhBead> = {
  "gold-sheen-obsidian": {
    displayName: "金曜石",
    description:
      "火山玻璃之上，浮动着一层流转的金色光晕。它属于那些向抱负前行、却不迷失自我的人——相传它能照见通往丰盛的真实路径，并消解疑虑的杂音。",
    origin: "墨西哥·哈利斯科——由冷却的火山熔流孕育",
    energyAlignment: "太阳轮 · 意志与丰盛之座",
  },
  "rutilated-quartz": {
    displayName: "钛晶",
    description:
      "清透的水晶之中，贯穿着一缕缕金色的金红石细丝，宛如被封存的日光。它是意念的增幅器，为佩戴者的追求注入动能，被珍视为「明照专注」之石。",
    origin: "巴西·米纳斯吉拉斯",
    energyAlignment: "顶轮 · 清明与金色驱力交织",
  },
  "nephrite-jade": {
    displayName: "和田玉",
    description:
      "东方的帝王之石，温润而内蕴光华。数千年来作为和合与静水流深之吉祥信物，玉贴肤而佩，以涵养心性、招引绵长的福泽。",
    origin: "中国·新疆和田",
    energyAlignment: "心轮 · 平衡、慈悲与丰盛",
  },
  amethyst: {
    displayName: "紫水晶",
    description:
      "一抹凝于石中的紫色静谧。长久以来与沉思者相伴，紫水晶平息躁动的心绪，为佩戴者围拢起一圈守护的安宁——于静定之中抵达清明。",
    origin: "乌拉圭——深穴大教堂式晶洞",
    energyAlignment: "眉心轮 · 直觉与静观之智",
  },
  "clear-quartz": {
    displayName: "白水晶",
    description:
      "万晶之王——纯净、通透、无限受纳。它承接佩戴者的意念，再加倍回赠。是一张空白的乐谱，任何一种共振皆可在其上谱写。",
    origin: "美国·阿肯色州",
    energyAlignment: "贯通诸轮 · 纯粹增幅",
  },
  "black-obsidian": {
    displayName: "黑曜石",
    description:
      "深渊之镜，被打磨成流动般的漆黑。守护之石——它静默地筑起一道抵御纷扰的屏障，一次又一次地将佩戴者带回坚实的大地。",
    origin: "亚美尼亚——更新世黑曜岩原",
    energyAlignment: "海底轮 · 扎根与化解恐惧",
  },
  citrine: {
    displayName: "黄水晶",
    description:
      "日光凝结而成的蜜色金黄。商贾之石，相传从不蓄留负面之气——它招引温暖、慷慨，以及财富在生命中的轻盈流转。",
    origin: "巴西·南里奥格兰德",
    energyAlignment: "太阳轮 · 璀璨的丰盛",
  },
  "smoky-quartz": {
    displayName: "茶晶",
    description:
      "浸润于柔和烟灰色深处的水晶。一枚修复之石，它带走一日的沉重，归还活力——在扎根的同时，不曾黯淡佩戴者的光。",
    origin: "苏格兰·凯恩戈姆山脉",
    energyAlignment: "海底轮 · 焕新与稳健的活力",
  },
  "red-agate": {
    displayName: "红玛瑙",
    description:
      "浓郁深红的暖意之石——红玛瑙承载着活力与勇气的能量。作为抵御负能量的护盾，它坚固心志，在疑虑时刻重燃自信之光。",
    origin: "中国·云南",
    energyAlignment: "海底轮 · 勇气与守护",
  },
  "black-hair-crystal": {
    displayName: "黑发晶",
    description:
      "清透的水晶与黑色电气石交织——既清明又护持。它净化能量场，同时安抚散乱的思绪，是守护与光明的双重馈赠。",
    origin: "巴西",
    energyAlignment: "海底轮与顶轮 · 净化清明",
  },
  "rose-quartz": {
    displayName: "粉水晶",
    description:
      "无条件之爱的象征——柔和的玫瑰色，温柔而宁静。它打开心扉，让给予与接受都同样自在，消融旧伤，为佩戴者的生命引入细腻的连结。",
    origin: "马达加斯加",
    energyAlignment: "心轮 · 爱与温柔疗愈",
  },
  "tiger-eye": {
    displayName: "虎眼石",
    description:
      "金色丝绢般的光芒在表面流转，宛如活焰——虎眼石兼具猎者的胆魄与观察者的耐心。专为以果敢行动追求丰盛者而生。",
    origin: "南非·北开普省",
    energyAlignment: "太阳轮 · 果敢与丰盛",
  },
  "lapis-lazuli": {
    displayName: "青金石",
    description:
      "夜空压缩成石——深邃靛蓝之中，金色黄铁矿星点闪烁。数千年来被奉为智慧与真理之石，青金石开启心智，通达更高理解，赋予佩戴者言说真相的清明。",
    origin: "阿富汗·巴达赫尚",
    energyAlignment: "眉心轮与喉轮 · 智慧与真理",
  },
};

export type LocalizedBead = {
  title: string;
  /** Secondary line (the other language's name). */
  sub: string;
  description: string;
  origin: string;
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
        origin: z.origin,
        energyAlignment: z.energyAlignment,
      };
    }
  }
  return {
    title: bead.westernName,
    sub: bead.name,
    description: bead.description,
    origin: bead.origin,
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
