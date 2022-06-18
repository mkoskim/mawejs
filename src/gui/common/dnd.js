//*****************************************************************************
//*****************************************************************************
//
// Drag'n'Drop support
//
//*****************************************************************************
//*****************************************************************************

import "./dnd.css"

import React from 'react'
//import {useDrag, useDrop} from 'react-dnd'

import {addClass} from "./factory"

//-----------------------------------------------------------------------------
// Put draggable elements inside Draggable
//-----------------------------------------------------------------------------

/*
export function Draggable({className, style, itemtype, item, ...props}) {

  const [{isDragging}, drag] = useDrag(() => ({
    type: itemtype,
    item: item,
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  className = addClass(
    className,
    isDragging ? "isDragging" : undefined
  )

  return <div
    ref={drag}
    className={className}
    style={style}
    {...props}
  />
}
*/

//-----------------------------------------------------------------------------
// Put dropzones inside Dropzone
//-----------------------------------------------------------------------------

/*
export function Dropzone({className, style, accept, onDrop, ...props}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: accept,
      drop: onDrop,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      })
    })
  )

  className = addClass(
    className,
    isOver ? "isOver" : undefined,
    canDrop ? "canDrop" : undefined,
  )

  return <div
    ref={drop}
    className={className}
    style={style}
    {...props}
  />
}
*/

//-----------------------------------------------------------------------------
// Sortable list
//-----------------------------------------------------------------------------

export function Sortable({className, style, accept, items, renderChild, ...props}) {
  /*
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: accept,
      drop: onDrop,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      })
    })
  )

  className = addClass(
    className,
    isOver ? "isOver" : undefined,
    canDrop ? "canDrop" : undefined,
  )

  return <div
    ref={drop}
    className={className}
    style={style}
    {...props}
  />
  */
  return <div
    className={className}
    style={style}
  >
    {items.map(i => renderChild(i))}
  </div>

}
