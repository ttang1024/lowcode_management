
import React, { type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SortableItem from './SortableItem';

export interface SortContainerProps<T> {
  // Whether sorting is disabled
  disabled?: boolean
  // Container class name
  className?: string
  // the currently accepted types
  type: string
  // the current list data
  value?: T[]
  // Whether to also trigger on swaponChange
  changeAnyway?: boolean
  // triggered when the order changes
  onChange?: (value: T[]) => void
}

export interface SortContainerItemProps {
  className?: string
  style?: React.CSSProperties
  index: number
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export interface SortableRecord<T> {
  ssssid: number
  item: T
}

export interface SortContainerContextValue {
  type: string
  items: SortableRecord<any>[]
  disabled?: boolean
  isDragging: () => boolean
  onMove: (dragIndex: number, hoverIndex: number) => void
  onStart: () => void
  onEnd: () => void
}

export const SortContainerContext = React.createContext<SortContainerContextValue>({} as SortContainerContextValue);

export function useSortContainer() {
  return useContext(SortContainerContext);
}

function createIdArray<T>(value: T[]) {
  return value?.map((item, index) => {
    return {
      item: item,
      ssssid: index,
    };
  }) as SortableRecord<T>[];
};

export default function SortContainer<T = any>(props: PropsWithChildren<SortContainerProps<T>>) {
  const [items, setItems] = useState(createIdArray<T>(props.value));
  const memo = useRef({ isDragging: false });

  const onStart = useCallback(() => {
    memo.current.isDragging = true;
  }, []);

  // Move
  const onMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((previous) => {
      const dragItem = previous[dragIndex];
      previous.splice(dragIndex, 1);
      previous.splice(hoverIndex, 0, dragItem);
      const newItems = [...previous];
      if (props.changeAnyway) {
        const value = newItems.map((item) => item.item);
        props.onChange?.(value);
      }
      return newItems;
    });
  }, []);

  // End move
  const onEnd = useCallback(() => {
    setItems((items) => {
      const value = items.map((item) => item.item);
      props.onChange && props.onChange(value);
      return items;
    });
    memo.current.isDragging = false;
  }, []);

  const onUpdate = () => {
    if (!memo.current.isDragging) {
      setItems(createIdArray<T>(props.value));
    }
  };

  useEffect(onUpdate, [props.value]);

  const contextValue = useMemo<SortContainerContextValue>(() => {
    return {
      items,
      disabled: props.disabled,
      isDragging: () => memo.current.isDragging,
      type: props.type,
      onMove: onMove,
      onEnd: onEnd,
      onStart,
    };
  }, [props.type, items, props.disabled]);

  return (
    <SortContainerContext.Provider
      value={contextValue}
    >
      <div className={`sortable-container ${contextValue.disabled ? '' : 'moveable [&_.sortable-item-view]:cursor-move'} ${props.className || ''}`}>
        {props.children}
      </div>
    </SortContainerContext.Provider>
  );
}

function ContainerItem(props: PropsWithChildren<SortContainerItemProps>) {
  const context = useContext(SortContainerContext);
  if (context.disabled) {
    return (
      <div style={props.style} className={props.className}>
        {props.children}
      </div>
    );
  }
  return (
    <SortableItem
      index={props.index}
      type={context.type}
      onClick={props.onClick}
      className={props.className}
      onStart={context.onStart}
      onMove={context.onMove}
      onEnd={context.onEnd}
      style={props.style}
      isDragging={context.isDragging()}
    >
      {props.children}
    </SortableItem>
  );
}

SortContainer.Item = ContainerItem;