import React from 'react';
import { Badge, Button, Confirm } from 'lowcode-kit';
import { SortableList } from 'lowcode-ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export interface XSortableListProps<T> {
  value?: T[]
  onAdd?: () => void
  onEdit?: (item: T, index: number) => void
  onChange?: (value: T[]) => void
  ribbonRender?: (item: T) => string
  // Render title
  titleRender: (item: T) => React.ReactNode
  // DeleteConfirmation text
  deleteConfirm: string
  // Whether it canDelete
  hideDelete?: (item: T) => boolean
}

export default function XSortableList<T>(props: XSortableListProps<T>) {
  const onRemove = (item: T) => {
    const fields = props.value;
    props.onChange(fields.filter((m) => m != item));
  };

  const renderItem = (item: T, index: number, wrapper?:boolean) => {
    return (
      <div className={`flex overflow-hidden border border-slate-100 bg-slate-50 px-[15px] py-2.5 text-xs leading-normal ${wrapper ? 'pr-10' : ''}`}>
        <div className="min-w-0 flex-1">
          {props.titleRender(item)}
          {/* {isGroup ? item.group : `${item.title} - ${item.name}`} */}
        </div>
        <div className="flex cursor-pointer items-start gap-[15px] text-base text-indigo-600">
          {
            props.onEdit && (
              <Pencil
                size="1em"
                className="action hover:text-indigo-800"
                onClick={() => props.onEdit(item, index)}
              />
            )
          }
          {props.hideDelete?.(item) ? null:
            <Confirm
              title={props.deleteConfirm}
              onConfirm={() => onRemove(item)}
            >
              <Trash2 size="1em" className="action hover:text-red-600" />
            </Confirm>}
        </div>
      </div>
    );
  };

  const renderGroup = (item: T, index: number) => {
    const ribbon = props.ribbonRender ? props.ribbonRender(item) : '';
    if (ribbon) {
      return <Badge.Ribbon color="green" text={ribbon}>{renderItem(item, index, true)}</Badge.Ribbon>;
    }
    return renderItem(item, index);
  };

  return (
    <React.Fragment>
      <SortableList
        type="XSortableList"
        className="sortable-x-list-configurer form-field-list text-xs"
        itemCls="x-sort-item pr-2.5"
        value={props.value || []}
        itemRender={renderGroup}
        onChange={props.onChange}
      />
      <div style={{ textAlign: 'center' }}>
        {
          !props.onAdd ? null : (
            <Button
              variant="primary"
              icon={<Plus size="1em" />}
              shape="circle"
              aria-label="Add"
              onClick={props.onAdd}
            />
          )
        }
      </div>
    </React.Fragment>
  );
}
