import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export interface DragItem {
  index: number
}

export interface SortableItemProps {
  type: string
  index: number
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onStart?: () => void
  style?: React.CSSProperties
  isDragging?: boolean
  onMove: (dragIndex: number, hoverIndex: number) => void
  onEnd: () => void
}

export default function SortableItem(props: React.PropsWithChildren<SortableItemProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragOptions, drag] = useDrag<DragItem, any, DragOptions>(
    () => ({
      type: props.type,
      item: () => {
        props.onStart && props.onStart();
        return ({ index: props.index });
      },
      end: () => {
        props.onEnd && props.onEnd();
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
        item: monitor.getItem(),
      }),
    }),
  );

  const [{ handlerId, isOver, canDrop }, drop] = useDrop<DragItem, any, DropOptions>(
    () => ({
      accept: props.type,
      hover: (item, _monitor) => {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }
        props.onMove && props.onMove(item.index, hoverIndex);
        // Reset the new index of the current item
        item.index = props.index;
      },
      collect: (monitor) => ({
        handlerId: monitor.getHandlerId(),
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [props.index],
  );

  drag(drop(ref));

  const isDragItem = props.isDragging && dragOptions?.item?.index === props.index;

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={props.style}
      onClick={props.onClick}
      className={`sortable-item-view relative mb-[15px] ${props.className || ''} ${isDragItem ? 'dragging border border-dashed border-indigo-500 bg-transparent [&_*]:invisible' : ''} ${isOver ? 'over' : ''} ${canDrop ? 'droppable' : ''}`}
    >
      {props.children}
    </div>
  );
}