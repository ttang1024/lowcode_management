import React, { useCallback, useContext } from 'react';
import { Button, Tooltip, cn, type ButtonProps } from 'lowcode-kit';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick' | 'type'> {
  visible?: boolean
  tooltip?: React.ReactNode
  action: string
  onClick?: (action: string) => void
  placement?: 'top' | 'right' | 'bottom' | 'left'
  /** Show the tooltip text as a visible label (designer bar). */
  label?: boolean
  /** `primary` renders the bar's main call to action. */
  type?: 'primary'
}

export const ActionButtonContext = React.createContext({
  onClick: (_action: string) => { },
});

/** Opens a designer action; icon-only on the canvas, labelled in the bar. */
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { visible, placement, label, className, tooltip, action, onClick, icon, type, ...rest },
  ref,
) {
  const context = useContext(ActionButtonContext);

  const enterAction = useCallback(() => {
    const handler = onClick || context.onClick;
    handler?.(action);
  }, [context.onClick, action, onClick]);

  if (visible == false) return null;

  const button = (
    <Button
      ref={ref}
      {...rest}
      variant={type === 'primary' ? 'primary' : 'ghost'}
      size={label ? 'md' : 'icon-sm'}
      icon={icon}
      onClick={enterAction}
      className={cn(!label && type !== 'primary' && 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700', className)}
    >
      {label ? tooltip : null}
    </Button>
  );

  // Labelled buttons already say what they do.
  return label ? button : <Tooltip title={tooltip} side={placement}>{button}</Tooltip>;
});
