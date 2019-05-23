import React from 'react'

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

//-----------------------------------------------------------------------------

export function Icon(props)
{
    const {name} = props;
    
    return (
        <Button><i className="material-icons">{name}</i></Button>
    );
}

export function Separator(props)
{
    return <span className="Separator" />;
}



