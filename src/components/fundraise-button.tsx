"use client";

import React from "react";
import styles from "./fundraise-button.module.css";
import { Heart } from "lucide-react";
import Link from "next/link";

interface FundraiseButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  playText?: string;
  nowText?: string;
  icon?: React.ReactNode;
  href?: string;
}

export const FundraiseButton: React.FC<FundraiseButtonProps> = ({
  onClick,
  className = "",
  disabled = false,
  type = "button",
  playText = "Donate",
  nowText = "Now",
  icon = <Heart className="h-5 w-5 fill-current" />,
  href,
}) => {
  const buttonContent = (
    <>
      <span className={styles.play}>{playText}</span>
      {icon}
      <span className={styles.now}>{nowText}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick as any}
        className={`${styles.fundraiseButton} ${className} flex items-center justify-center`}
        style={{ textDecoration: "none" }}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick as any}
      disabled={disabled}
      className={`${styles.fundraiseButton} ${className}`}
    >
      {buttonContent}
    </button>
  );
};
