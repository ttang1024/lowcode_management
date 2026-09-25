/**
 * @module abstract-menu
 * @description Kit `Menu` rendered from an {@link AbstractMenuType} tree.
 */
import React from 'react';
import { Menu, type MenuItem } from 'lowcode-kit';
import type { AbstractMenuProps, AbstractMenuType, SelectMenuInfo } from '../interface';

export type { AbstractMenuProps, SelectMenuInfo };

function toItems(menus: AbstractMenuType[] = []): MenuItem[] {
  return menus
    // `virtual` entries are route-matching/breadcrumb placeholders (their href
    // carries unresolved params like `/admin/:app/page/:action`). They must not
    // render as selectable menu items, otherwise selecting one navigates to the
    // literal `:app` URL.
    .filter((menu) => !menu.virtual)
    .map((menu) => {
      const children = menu.children ? toItems(menu.children) : undefined;
      return {
        key: String(menu.key || menu.path || menu.url || menu.name),
        icon: menu.icon,
        label: menu.title ?? menu.name,
        // Collapse to a clickable leaf when every child was filtered out,
        // so it doesn't render as an empty submenu.
        children: children && children.length ? children : undefined,
      };
    });
}

const AbstractMenu: React.FC<AbstractMenuProps> = ({ menus = [], selectedKey, onSelect, ...rest }) => {
  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={toItems(menus)}
      onSelect={(info) => onSelect?.({ key: info.key, keyPath: info.keyPath } as SelectMenuInfo)}
      {...rest}
    />
  );
};

export default AbstractMenu;
