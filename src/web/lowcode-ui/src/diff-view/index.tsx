import '../code-editor';
import 'ace-diff/dist/ace-diff.min.css';
import 'ace-diff/dist/ace-diff-twilight.min.css';
import 'ace-builds/src-noconflict/theme-ambiance';
import AceDiff from 'ace-diff';
import { useCallback, useRef, useState } from 'react';
import { Button, Modal } from 'lowcode-kit';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowLeftToLine, ArrowRightToLine, ArrowUp } from 'lucide-react';

interface DiffAceEditor {
  ace: {
    getValue: () => string
    scrollToRow: (row: number, center: boolean, animate: boolean, callback: Function) => void
    getCursorPosition: () => { row: number, column: number }
    session: any
  }
}
interface DiffLine {
  leftEndLine: number
  leftStartLine: number
  rightEndLine: number
  rightStartLine: number
}

export interface DifferInstance {
  editors: {
    left: DiffAceEditor
    right: DiffAceEditor
  }
  diffs: any[]
  destroy: () => void
}

export interface DiffInnerViewProps {
  mode?: string
  leftTitle: React.ReactNode
  rightTitle: React.ReactNode
  oldValue: string
  newValue: string
  differRef?: React.MutableRefObject<DifferInstance>
}
export interface DiffViewProps extends Omit<DiffInnerViewProps, 'differRef'> {
  open?: boolean
  title?: React.ReactNode
  closable?: boolean
  onCancel?: () => void
  onSubmit: (content: string) => void
}


function DiffInnerView(props: DiffInnerViewProps) {
  const memo = useRef({
    created: false,
    currentRow: 0,
  });
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const differRef = useRef<DifferInstance>(undefined);

  const getRef = () => {
    if (memo.current.created) return;
    memo.current.created = true;
    setTimeout(() => {
      const instance = differRef.current = props.differRef.current = new AceDiff({
        element: '.ace-diff-view-container',
        left: {
          mode: 'ace/mode/json',
          theme: 'ace/theme/vscode-dark',
          content: props.oldValue,
        },
        right: {
          mode: 'ace/mode/json',
          theme: 'ace/theme/vscode-dark',
          content: props.newValue,
        },
      }) as DifferInstance;

      const left = instance.editors.left.ace;
      const right = instance.editors.right.ace;
      const runtime = {
        trigger: '',
      };
      const onChange = () => {
        setDiffs([...instance.diffs]);
      };

      right.session.on('changeScrollLeft', function(scrollLeft) {
        if (runtime.trigger == 'left') {
          runtime.trigger = '';
          return;
        }
        runtime.trigger = 'right';
        left.session.setScrollLeft(scrollLeft);
      });
      left.session.on('changeScrollLeft', function(scrollLeft) {
        if (runtime.trigger == 'right') {
          runtime.trigger = '';
          return;
        }
        runtime.trigger = 'left';
        right.session.setScrollLeft(scrollLeft);
      });

      right.session.on('change', onChange);
      left.session.on('change', onChange);
      setTimeout(() => {
        setDiffs(instance.diffs || []);
      }, 1000);
    }, 10);
  };

  const navigateToDiff = useCallback((direction: 'up' | 'down') => {
    const differ = differRef.current;
    const leftAce = differRef.current?.editors?.left?.ace;
    const rightAce = differRef.current?.editors?.right?.ace;
    const session = leftAce?.session;
    if (session) {
      const diffs = differ.diffs as DiffLine[];
      const row = memo.current.currentRow;
      const diff = direction == 'down' ? diffs.find((m) => m.leftStartLine >= row) : [...diffs].reverse().find((m) => m.leftStartLine <= row);
      if (diff) {
        memo.current.currentRow = direction == 'down' ? diff.leftStartLine + 1 : diff.leftStartLine - 1;
        leftAce.scrollToRow(diff.leftStartLine - 10, true, true, () => { });
        rightAce.scrollToRow(diff.rightStartLine - 10, true, true, () => { });
      }
    }
  }, []);

  const gotoNext = useCallback(() => {
    navigateToDiff('down');
  }, []);

  const gotoPrev = useCallback(() => {
    navigateToDiff('up');
  }, []);

  return (
    <div className="conflict-view-wrapper overflow-hidden rounded-xl">
      <div className="bg-[#1f1f1f] p-2.5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="mx-4 text-[#f88070]">Total conflicts: {diffs.length}</span>
          <button type="button" onClick={gotoNext} aria-label="Next conflict" className="flex cursor-pointer rounded p-1 hover:bg-white/10 active:opacity-70"><ArrowDown size="1em" /></button>
          <button type="button" onClick={gotoPrev} aria-label="Previous conflict" className="flex cursor-pointer rounded p-1 hover:bg-white/10 active:opacity-70"><ArrowUp size="1em" /></button>
        </div>
        <div className="mt-1 flex text-[#4ec9b0] [&>div]:flex-1 [&>div]:text-center">
          <div>{props.leftTitle}</div>
          <div>{props.rightTitle}</div>
        </div>
      </div>
      <div className="ace-diff-view-container relative h-[70vh] overflow-x-auto" ref={getRef}>
      </div>
    </div>
  );
}

export default function DiffView({ closable = true, ...props }: DiffViewProps) {
  const differRef = useRef<DifferInstance>(undefined);

  const doConfirm = () => {
    return new Promise<void>((resolve, reject) => {
      const diffs = differRef.current.diffs;
      if (diffs.length < 1) {
        resolve();
        return;
      }
      Modal.confirm({
        title: 'Unresolved conflicts',
        content: `${diffs.length} conflict${diffs.length === 1 ? '' : 's'} remain. Use this version anyway?`,
        onOk: () => resolve(),
        onCancel: () => reject(),
      });
    });
  };

  // Submit left
  const onSubmitLeft = useCallback(async() => {
    await doConfirm();
    const editor = differRef.current.editors.left;
    const value = editor.ace.getValue();
    differRef.current.destroy();
    props.onSubmit(value);
  }, []);

  // Submit right
  const onSubmitRight = useCallback(async() => {
    await doConfirm();
    const editor = differRef.current.editors.right;
    const value = editor.ace.getValue();
    differRef.current.destroy();
    props.onSubmit(value);
  }, []);

  return (
    <Modal
      closable={closable}
      open={props.open}
      title={props.title}
      width="90%"
      maskClosable={false}
      onCancel={props.onCancel}
      footer={(
        <>
          {props.onCancel && <Button size="lg" onClick={props.onCancel}>Cancel</Button>}
          <Button size="lg" variant="danger" icon={<ArrowRightToLine size="1em" />} onClick={onSubmitLeft}>
            Use {props.leftTitle}
          </Button>
          <Button size="lg" variant="danger" icon={<ArrowLeftToLine size="1em" />} onClick={onSubmitRight}>
            Use {props.rightTitle}
          </Button>
        </>
      )}
    >
      <DiffInnerView {...props} differRef={differRef} />
    </Modal>
  );
}

export function openDiffer(props: Omit<DiffViewProps, 'open'>) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const onOk = (content: string) => {
    props.onSubmit?.(content);
    instance.unmount();
  };

  const onCancel = !props.onCancel ? null : () => {
    props.onCancel();
    instance.unmount();
  };

  const instance = createRoot(div);
  instance.render(
    <DiffView
      {...props}
      open={true}
      onCancel={onCancel}
      onSubmit={onOk}
    />,
  );
}