import type { MouseEvent } from 'react';

type LogoSize = 'header' | 'login' | 'splash';

interface LogoProps {
  size: LogoSize;
  onClick?: (event: MouseEvent<HTMLImageElement>) => void;
}

const sizeClass: Record<LogoSize, string> = {
  header: 'logo logo-header',
  login: 'logo logo-login',
  splash: 'logo logo-splash',
};

export default function Logo({ size, onClick }: LogoProps): JSX.Element {
  return (
    <img
      src="/ELITEQuest_Logo.png"
      alt="ELITEQuest"
      className={sizeClass[size]}
      onClick={onClick}
      draggable={false}
    />
  );
}
