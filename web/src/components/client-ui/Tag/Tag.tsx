/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import classNames from 'classnames';
import { useTheme } from 'emotion-theming';
import React from 'react';

import { mediaQueries } from 'src/styles/media';

interface IProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'default';
}

export const Tag = React.forwardRef<HTMLSpanElement, IProps>(({ children, className, color, ...props }, ref) => {
  const theme = useTheme<ClientUITheme>();
  return (
    <small
      ref={ref}
      css={css`
        font-size: 12px;
        background: ${theme.primaryColor};
        color: ${theme.textOnPrimaryColor};
        padding: 2.5px 5px;
        font-weight: bold;
        text-transform: uppercase;

        @media ${mediaQueries.maxWidth768} {
          font-size: 10px;
        }
      `}
      className={classNames(className, color)}
      {...props}
    >
      {children}
    </small>
  );
});
