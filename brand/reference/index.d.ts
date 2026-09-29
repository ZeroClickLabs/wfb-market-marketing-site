import * as React from "react";

export type IconName = "calendar" | "clock" | "map-pin" | "card" | "basket" | "carrot" | "leaf" | "sun" | "rain" | "music" | "tent" | "info" | "alert" | "check-circle" | "x-circle" | "arrow-right" | "instagram" | "facebook" | "mail";
export type IllustrationName = "tomato" | "sweet-corn" | "carrots" | "apple" | "bread" | "sunflower";
export type Tone = "heirloom" | "bay" | "corn" | "kale" | "beet" | "deep" | "sage" | "kraft" | "canvas" | "paper" | "kale-tint" | "bay-tint" | "heirloom-tint" | "corn-tint" | "beet-tint";
export type Category = "produce" | "meat" | "dairy" | "bakery" | "prepared" | "flowers" | "crafts" | "other";
export type MarketId = "summer" | "night" | "popup" | "winter";

/** The approved marks, rendered inline. */
export interface LogoProps { variant?: "emblem" | "badge" | "icon" | "lockup" | "lockup-reverse" | "night" | "winter" | "popup"; /** px */ width?: number; href?: string; /** Accessible name; defaults to "Whitefish Bay Farmers Market". */ label?: string; className?: string; }
export declare function Logo(props: LogoProps): JSX.Element;

export interface IllustrationProps { name: IllustrationName; size?: number; /** Only when the image carries meaning. */ label?: string; className?: string; }
export declare function Illustration(props: IllustrationProps): JSX.Element;

export interface IconProps { name: IconName; size?: number; strokeWidth?: number; label?: string; className?: string; }
export declare function Icon(props: IconProps): JSX.Element;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** accent (heirloom, one per view, default) · primary (bay) · outline · inverse (on deep) · link */
  variant?: "accent" | "primary" | "outline" | "inverse" | "link";
  size?: "sm" | "md" | "lg"; icon?: IconName; iconAfter?: IconName; /** Renders an <a>. */ href?: string; children: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;

export interface TagProps { category?: Category; children?: React.ReactNode; className?: string; }
export declare function Tag(props: TagProps): JSX.Element;
export interface BadgeProps { tone?: "neutral" | "info" | "success" | "warning" | "danger" | "solid"; icon?: IconName; children: React.ReactNode; className?: string; }
export declare function Badge(props: BadgeProps): JSX.Element;
export interface NoticeProps { tone?: "info" | "success" | "warning" | "danger"; icon?: IconName; title?: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; className?: string; }
export declare function Notice(props: NoticeProps): JSX.Element;

interface FieldBase { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; id?: string; className?: string; }
export interface TextFieldProps extends FieldBase, Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className"> { multiline?: boolean; }
export declare function TextField(props: TextFieldProps): JSX.Element;
export interface SelectProps extends FieldBase, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> { options: Array<string | { value: string; label: string }>; placeholder?: string; }
export declare function Select(props: SelectProps): JSX.Element;
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> { label: React.ReactNode; hint?: React.ReactNode; }
export declare function Checkbox(props: CheckboxProps): JSX.Element;

export declare function Ornament(props: { color?: string; className?: string }): JSX.Element;
export interface SectionHeadingProps { title: React.ReactNode; eyebrow?: string; lead?: React.ReactNode; align?: "center" | "left"; as?: "h1" | "h2" | "h3"; ornament?: boolean; className?: string; }
export declare function SectionHeading(props: SectionHeadingProps): JSX.Element;
export interface SectionEdgeProps { kind?: "awning" | "wave"; /** Colour of the edge itself. */ tone?: Tone; /** Awning's second stripe. */ alt?: Tone; /** Colour behind the edge. */ ground?: Tone; /** Wave pointing down. */ flip?: boolean; className?: string; }
export declare function SectionEdge(props: SectionEdgeProps): JSX.Element;
export declare function Bunting(props: { className?: string }): JSX.Element;

export interface AnnouncementBarProps { children: React.ReactNode; label?: string; href?: string; linkText?: string; className?: string; }
export declare function AnnouncementBar(props: AnnouncementBarProps): JSX.Element;
export interface SiteHeaderProps { links?: Array<{ label: string; href?: string; current?: boolean }>; cta?: { label: string; href?: string; icon?: IconName } | null; status?: string; homeHref?: string; className?: string; }
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
export interface HeroProps { script?: string | false; title?: string; sub?: React.ReactNode; actions?: React.ReactNode[]; ariaLabel?: string; className?: string; }
export declare function Hero(props: HeroProps): JSX.Element;

export interface VendorCardProps { name: string; category?: Category; categories?: Category[]; description?: string; stall?: string | number; from?: string; illustration?: IllustrationName; image?: string; imageAlt?: string; acceptsSnap?: boolean; href?: string; className?: string; }
export declare function VendorCard(props: VendorCardProps): JSX.Element;
export interface EventCardProps { date: string; title: string; market?: MarketId; eyebrow?: string; time?: string; location?: string; status?: React.ReactNode; href?: string; className?: string; }
export declare function EventCard(props: EventCardProps): JSX.Element;
export interface CircleTileProps { label: string; illustration?: IllustrationName; tone?: Tone; note?: string; href?: string; className?: string; }
export declare function CircleTile(props: CircleTileProps): JSX.Element;
export interface ScheduleRow { market: string; market_id?: MarketId; when: string; hours: string; where: string; note?: string; }
export declare function MarketSchedule(props: { rows: ScheduleRow[]; caption?: string; className?: string }): JSX.Element;
export declare function NewsletterBand(props: { title?: string; text?: string; illustration?: IllustrationName; className?: string }): JSX.Element;
export declare function SiteFooter(props: { year?: number; /** Tone of the section above, shown behind the wave (default "sage"). */ above?: Tone; className?: string }): JSX.Element;
/** Reference home page assembled from the components above. */
export declare function HomePage(): JSX.Element;
