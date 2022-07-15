import React, { ReactNode } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useCharge } from '../state/docket';
import { getAppHref } from '../state/util';

interface DeskLinkProps extends React.AnchorHTMLAttributes<any> {
  desk: string;
  to?: string;
  children?: ReactNode;
  className?: string;
}

export function DeskLink({ children, className, desk, to = '', ...rest }: DeskLinkProps) {
  const { push } = useHistory();
  const charge = useCharge(desk);

  if (!charge) {
    return null;
  }
  if (desk === window.desk) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  const href = `${getAppHref(charge.href)}${to}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      {...rest}
      onClick={() => push('/')}
    >
      {children}
    </a>
  );
}
