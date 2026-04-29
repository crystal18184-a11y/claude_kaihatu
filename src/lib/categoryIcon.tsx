import {
  Beef, Fish, Egg, Milk, Salad, Apple, Cherry, Sprout, Leaf, Bean,
  Croissant, Wheat, Soup, ChefHat, Droplets, CupSoda, Cookie, IceCream2,
  Snowflake, Package, SprayCan, Pill, Sparkles, Shirt, ShoppingBag,
  Plug, Smartphone, Baby, Pencil, GraduationCap, BookOpen,
  UtensilsCrossed, Coffee, Beer, Cake, Wine,
  TrainFront, Gamepad2, Repeat, Home, Lightbulb, Wifi, Shield, CreditCard,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

const SUB_ICON: Record<string, LucideIcon> = {
  // 食費
  "肉類": Beef,
  "魚介類": Fish,
  "卵": Egg,
  "乳製品": Milk,
  "野菜": Salad,
  "果物": Apple,
  "きのこ": Sprout,
  "海藻・乾物": Leaf,
  "豆腐・大豆製品": Bean,
  "漬物・発酵食品": Cherry,
  "パン": Croissant,
  "米・穀物": Wheat,
  "麺類": Soup,
  "調味料": ChefHat,
  "油・ドレッシング": Droplets,
  "飲み物": CupSoda,
  "お菓子・スナック": Cookie,
  "アイス・冷菓": IceCream2,
  "冷凍食品": Snowflake,
  "レトルト・缶詰": Package,

  // 日用品・生活
  "日用品": SprayCan,
  "医療・薬": Pill,
  "化粧品・美容": Sparkles,

  // ファッション
  "衣服・靴": Shirt,
  "バッグ・アクセサリー": ShoppingBag,

  // 電化製品・家電
  "家電": Plug,
  "スマホ・PC・ガジェット": Smartphone,

  // 子ども・教育
  "子ども用品": Baby,
  "文具・おもちゃ": Pencil,
  "習い事・教育費": GraduationCap,

  // 外食・グルメ
  "食事・テイクアウト（外食）": ShoppingBag,
  "食事（外食）": UtensilsCrossed,
  "ドリンク（外食）": Coffee,
  "アルコール（外食）": Beer,
  "デザート（外食）": Cake,
  "飲み会・居酒屋": Wine,

  // 娯楽・その他
  "交通・外出": TrainFront,
  "趣味・娯楽": Gamepad2,

  // 固定費・サブスク
  "サブスク・定額サービス": Repeat,
  "家賃・住宅費": Home,
  "水道・光熱費": Lightbulb,
  "通信費": Wifi,
  "保険料": Shield,
  "その他固定費": CreditCard,

  "その他": Package,
};

const MAJOR_ICON: Record<string, LucideIcon> = {
  "食費": ShoppingCart,
  "日用品・生活": Home,
  "ファッション": Shirt,
  "電化製品・家電": Smartphone,
  "子ども・教育": BookOpen,
  "外食・グルメ": UtensilsCrossed,
  "娯楽・その他": Sparkles,
  "固定費・サブスク": Repeat,
};

const MAJOR_COLOR: Record<string, string> = {
  "食費": "#20C7B5",
  "日用品・生活": "#4A9FD4",
  "ファッション": "#F65F8B",
  "電化製品・家電": "#7B61D4",
  "子ども・教育": "#F0A500",
  "外食・グルメ": "#F59E0B",
  "娯楽・その他": "#FF7043",
  "固定費・サブスク": "#94A3B8",
};

export function categoryToMajor(sub: string): string {
  // Look up via the existing major mapping defined in pages; here we provide a basic fallback
  return MAJOR_BY_SUB[sub] ?? "娯楽・その他";
}

const MAJOR_BY_SUB: Record<string, string> = {
  "肉類": "食費", "魚介類": "食費", "卵": "食費", "乳製品": "食費",
  "野菜": "食費", "果物": "食費", "きのこ": "食費", "海藻・乾物": "食費",
  "豆腐・大豆製品": "食費", "漬物・発酵食品": "食費", "パン": "食費",
  "米・穀物": "食費", "麺類": "食費", "調味料": "食費", "油・ドレッシング": "食費",
  "飲み物": "食費", "お菓子・スナック": "食費", "アイス・冷菓": "食費",
  "冷凍食品": "食費", "レトルト・缶詰": "食費",
  "日用品": "日用品・生活", "医療・薬": "日用品・生活", "化粧品・美容": "日用品・生活",
  "衣服・靴": "ファッション", "バッグ・アクセサリー": "ファッション",
  "家電": "電化製品・家電", "スマホ・PC・ガジェット": "電化製品・家電",
  "子ども用品": "子ども・教育", "文具・おもちゃ": "子ども・教育", "習い事・教育費": "子ども・教育",
  "食事・テイクアウト（外食）": "外食・グルメ", "食事（外食）": "外食・グルメ",
  "ドリンク（外食）": "外食・グルメ", "アルコール（外食）": "外食・グルメ",
  "デザート（外食）": "外食・グルメ", "飲み会・居酒屋": "外食・グルメ",
  "交通・外出": "娯楽・その他", "趣味・娯楽": "娯楽・その他", "その他": "娯楽・その他",
  "サブスク・定額サービス": "固定費・サブスク", "家賃・住宅費": "固定費・サブスク",
  "水道・光熱費": "固定費・サブスク", "通信費": "固定費・サブスク",
  "保険料": "固定費・サブスク", "その他固定費": "固定費・サブスク",
};

type IconProps = { name?: string; className?: string; strokeWidth?: number; style?: React.CSSProperties };

export function CategoryIcon({ name, className = "w-5 h-5", strokeWidth = 1.8, style }: IconProps) {
  const Icon = (name && SUB_ICON[name]) || Package;
  return <Icon className={className} strokeWidth={strokeWidth} style={style} />;
}

export function MajorCategoryIcon({ name, className = "w-5 h-5", strokeWidth = 1.8, style }: IconProps) {
  const Icon = (name && MAJOR_ICON[name]) || Package;
  return <Icon className={className} strokeWidth={strokeWidth} style={style} />;
}

export function getMajorColor(name?: string): string {
  return (name && MAJOR_COLOR[name]) || "#94A3B8";
}

export function getCategoryColor(sub?: string): string {
  if (!sub) return "#94A3B8";
  const major = MAJOR_BY_SUB[sub];
  return getMajorColor(major);
}
