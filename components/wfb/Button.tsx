import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx, SmartLink } from "./utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** accent (heirloom, one per view, default) · primary (bay) · outline · inverse (on deep) · link */
  variant?: "accent" | "primary" | "outline" | "inverse" | "link";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconAfter?: IconName;
  /** Renders a link. */
  href?: string;
  children: ReactNode;
}

export function Button({ variant = "accent", size = "md", icon, iconAfter, href, children, className, type, ...rest }: ButtonProps) {
  const cls = cx("wfb-btn", `wfb-btn-${variant}`, size !== "md" && `wfb-btn-${size}`, className);
  const kids = (
    <>
      {icon ? <Icon name={icon} size={18} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </>
  );
  if (href) return <SmartLink href={href} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{kids}</SmartLink>;
  return <button type={type ?? "button"} className={cls} {...rest}>{kids}</button>;
}
