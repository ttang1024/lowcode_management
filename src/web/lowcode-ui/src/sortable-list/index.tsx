import React from 'react';
import SortContainer, { type SortContainerProps, SortContainerContext } from './SortContainer';

export interface SortableListProps<T> extends SortContainerProps<T> {
  // Item container class name
  itemCls?: string
  // Custom item render function
  itemRender: (data: T, index: number) => React.ReactNode | React.ReactElement
}

export {
  SortContainer,
};

export default function SortableList<T = any>({ itemRender, itemCls, ...props }: SortableListProps<T>) {
  return (
    <SortContainer
      {...props}
    >
      <SortContainerContext.Consumer>
        {
          (context) => {
            return context.items?.map((item, index) => {
              return (
                <SortContainer.Item
                  index={index}
                  key={item.ssssid}
                  className={itemCls}
                >
                  {itemRender(item.item, index)}
                </SortContainer.Item>
              );
            });
          }
        }
      </SortContainerContext.Consumer>
    </SortContainer>
  );
}