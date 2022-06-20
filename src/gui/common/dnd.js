//*****************************************************************************
//*****************************************************************************
//
// Draggable items
//
//*****************************************************************************
//*****************************************************************************

import "./dnd.css"

//-----------------------------------------------------------------------------

import {
  DndContext, DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  useDraggable,
} from '@dnd-kit/core';

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

//-----------------------------------------------------------------------------

export {
  DndContext, DragOverlay,
  useSensors, useSensor, MouseSensor,

  useDraggable,
  useSortable, SortableContext,
}

//-----------------------------------------------------------------------------

export function SortableItem({id, type, content, ...props}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, data: { type, content } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    {...props}
  />
}

export function DraggableItem({id, type, content, ...props}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useDraggable({ id, data: { type, content } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    {...props}
  />
}