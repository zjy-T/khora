import type { Locale } from "@/lib/i18n";
import type { BraceletFormula } from "@/lib/types";

/** Chinese (简体) name + description for each curated/community bracelet. */
export const BRACELET_ZH: Record<string, { name: string; description: string }> =
  {
    "curated-abundance": {
      name: "丰盛",
      description:
        "为向内招引富足者而作的编排——以钛晶放大意念，黄水晶令财运流转，和田玉使其绵延长久。",
    },
    "curated-serenity": {
      name: "宁静",
      description:
        "一组为心绪静定而设的安谧编排——紫水晶予静观之智，白水晶辟出空灵，茶晶卸下一日的沉重。",
    },
    "curated-vitality": {
      name: "活力",
      description:
        "一圈扎根的环，为修复与稳健之力而作——茶晶与黑曜石以定其根，和田玉以和其气，一颗黄水晶以暖其心。",
    },
    "community-sovereigns-rest": {
      name: "君王之憩",
      description: "历经一季拼搏后编成——以守护环护抱负之腕，佐以紫水晶，不忘静定。",
    },
    "community-goldenhour": {
      name: "暮金时刻",
      description:
        "一圈明亮而乐观的环，自办公桌佩戴至晚宴——黄水晶与钛晶予以动能，和田玉令其不失优雅。",
    },
    "community-still-water": {
      name: "止水",
      description:
        "为过度受扰的心而设——一组近乎单色的水晶与紫水晶编排，宛如一次屏住的呼吸。",
    },
    "community-the-cartographer": {
      name: "制图师",
      description:
        "为一位即将踏上未知旅程的友人而作——以扎根的黑曜石搭配增幅的钛晶，寻得并守住前路。",
    },
    "curated-devotion": {
      name: "虔心",
      description:
        "为那些正在重新开放自己、迎向爱的人而作——粉水晶以温柔相邀，紫水晶守护这片空间，白水晶作为静默的见证。",
    },
    "curated-midnight": {
      name: "子夜",
      description:
        "为那些以守护者之姿穿行于世的人——黑曜石在外围守卫，黑发晶以内在清明护持，青金石赐予辨别真伪的智慧。",
    },
    "curated-meridian": {
      name: "子午",
      description:
        "为探求真相者而作的编排——青金石将思维与信念对齐，白水晶守住光明，紫水晶温柔化解不可强求之事。",
    },
    "curated-momentum": {
      name: "动势",
      description:
        "为驱动者而作——发晶放大意念并加速其运行，虎眼石予以果决行动的勇气，金曜石将抱负的弧线引入现实。",
    },
    "curated-sanctuary": {
      name: "庇所",
      description:
        "一圈内在均衡之园——和田玉为稳固之轴，粉水晶令心门常开，茶晶默默转化积累的一切重量。",
    },
    "curated-ember": {
      name: "余烬",
      description:
        "耗竭之后，复元之前——茶晶卸下倦怠的积淀，红玛瑙重燃生命之火，黑曜石将恢复的能量封藏在内。",
    },
    "curated-nocturne": {
      name: "夜曲",
      description:
        "为入眠前的沉思时刻而作——紫水晶沉淀一日的积滞，青金石开启内观之眼，白水晶以从容的静默将一切持守。",
    },
  };

/** Locale-appropriate name + description for a bracelet formula. */
export function localizeBracelet(
  formula: Pick<BraceletFormula, "id" | "name" | "description">,
  locale: Locale,
): { name: string; description: string } {
  if (locale === "zh") {
    const z = BRACELET_ZH[formula.id];
    if (z) return z;
  }
  return { name: formula.name, description: formula.description };
}
