import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx } from "./utils";

export type Category = "produce" | "meat" | "dairy" | "bakery" | "prepared" | "flowers" | "crafts" | "other";

export const CATEGORY_LABELS: Record<Category, string> = {
  produce: "Produce", meat: "Meat & eggs", dairy: "Dairy & cheese", bakery: "Bakery",
  prepared: "Prepared food", flowers: "Flowers", crafts: "Crafts", other: "Other",
};

export function Tag({ category = "other", children, className }: { category?: Category; children?: ReactNode; className?: string }) {
  return <span className={cx("wfb-tag", `wfb-tag-${category}`, className)}>{children ?? CATEGORY_LABELS[category]}</span>;
}

export interface BadgeProps {
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "solid";
  icon?: IconName;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span className={cx("wfb-badge", `wfb-badge-${tone}`, className)}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </span>
  );
}

const TONE_ICON = { info: "info", success: "check-circle", warning: "alert", danger: "x-circle" } as const;

export interface NoticeProps {
  tone?: "info" | "success" | "warning" | "danger";
  icon?: IconName;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Notice({ tone = "info", icon, title, children, action, className }: NoticeProps) {
  return (
    <div className={cx("wfb-notice", `wfb-notice-${tone}`, className)} role={tone === "danger" || tone === "warning" ? "alert" : "status"}>
      <span className="wfb-notice-ic"><Icon name={icon ?? TONE_ICON[tone]} size={20} /></span>
      <div>
        {title ? <p className="wfb-notice-title">{title}</p> : null}
        {children ? <p className="wfb-notice-body">{children}</p> : null}
        {action ? <div className="wfb-notice-action">{action}</div> : null}
      </div>
    </div>
  );
}
