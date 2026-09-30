import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkHref = string | { pathname?: string };

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: LinkHref;
  children?: ReactNode;
};

export default function Link({ href, children, ...props }: LinkProps) {
  const resolvedHref = typeof href === "string" ? href : href.pathname || "#";
  return <a href={resolvedHref} {...props}>{children}</a>;
}
