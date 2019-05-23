import React from 'react'

import { cx, css } from 'emotion'

//-----------------------------------------------------------------------------

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
    <div
        {...props}
        ref={ref}
        className="Toolbar"
    />
))

export const Statusbar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className="Statusbar"
  />
))

//-----------------------------------------------------------------------------

export const Button = React.forwardRef(
    ({ className, active, reversed, ...props }, ref) => (
<span
      {...props}
      ref={ref}
      className="Button"
    />
))

