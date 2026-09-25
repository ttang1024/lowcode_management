import React, { useContext } from 'react';
import { Confirm, type UploadFile } from 'lowcode-kit';
import { useSortContainer } from '../../../src/sortable-list/SortContainer';
import { SortContainer } from '../../../src/sortable-list';

interface AdvanceUploadItemProps {
  file: UploadFile
  deleteConfirm?: string
  fileList: UploadFile[]
  originNode: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
}

export const ConfirmContext = React.createContext({ file: null as UploadFile | null });

/** One uploaded file: draggable when sorting is on, asks before delete when configured. */
export default function AdvanceUploadItem(props: AdvanceUploadItemProps) {
  const { fileList, file } = props;
  const context = useSortContainer();
  const index = fileList.indexOf(file);
  const item = (context?.items || [])[index];
  const confirm = useContext(ConfirmContext);

  return (
    <Confirm
      title={props.deleteConfirm || 'Remove this file?'}
      danger
      disabled
      open={confirm?.file?.uid === file.uid}
      onConfirm={props.onConfirm}
      onCancel={props.onCancel}
    >
      <div>
        <SortContainer.Item index={index} key={item?.ssssid} className="!mb-0">
          {props.originNode}
        </SortContainer.Item>
      </div>
    </Confirm>
  );
}
