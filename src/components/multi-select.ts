import { BaseComponent } from './base-component';

import * as $ from 'jquery';

export class MultiSelect extends BaseComponent<MultiSelectConfig> {
  checkboxElements = this.element.find('.mdl-checkbox__input');
  menuItemElements = this.element.find('.mdl-list__item');
  selectedCountElement = this.element.find('.multi-select-count');
  menuElement = this.element.find('.mdl-menu');
  buttonElement = this.element.find('#' + this.menuElement.attr('for'));
  materialMenu: any;

  selectedCount = 0;

  async init() {
    this.buttonElement.on('click', () => {
      this.menuElement[0].scrollTo({ left: 0, top: 0 });
    });

    this.checkboxElements.on('change', () => {
      this.updateSelectedCount();
    });

    this.menuItemElements.on('click', (evt) => {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      evt.stopPropagation();
      const menuItem = $(evt.currentTarget);
      const checkbox: any = ($(menuItem).find('.mdl-checkbox')[0] as any).MaterialCheckbox;
      const checkboxElement = $(menuItem).find('input[type="checkbox"]');
      if (checkboxElement) {
        if (checkboxElement.prop('checked')) {
          checkbox.uncheck();
        } else {
          checkbox.check();
        }
        this.updateSelectedCount();
      }
    });

    setTimeout(() => {
      componentHandler.upgradeDom();
      this.materialMenu = (this.menuElement as any).MaterialMenu;
      this.menuElement.css('width', this.buttonElement.outerWidth() || 300);
      this.menuElement.on('click', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
      });
    }, 0);

    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const checked = this.menuItemElements.has('input:checked');
    this.selectedCountElement.attr('data-badge', checked.length.toString());
    if (this.selectedCount !== checked.length) {
      this.selectedCountElement.addClass('rubberBand');
      setTimeout(() => {
        this.selectedCountElement.removeClass('rubberBand');
      }, 500);
    }
    this.selectedCount = checked.length;
  }
}

export interface MultiSelectConfig {
  selectedListLimit: number;
}