'use strict';
import { QWPage } from '@qualweb/qw-page';
import { QWElement } from '@qualweb/qw-element';
import { AccessibilityUtils } from '@qualweb/util';

function getElementRoleAName(elementQW: QWElement, pageQW: QWPage, aName: string | undefined): string | null {
  let explicitRole = elementQW.getElementAttribute("role");
  let role = explicitRole;
  if (explicitRole === null || ((explicitRole === "none" || explicitRole === "presentation") && (AccessibilityUtils.isElementFocusable(elementQW,pageQW) ||AccessibilityUtils.elementHasGlobalARIAPropertyOrAttribute(elementQW,pageQW)))) {
    role = AccessibilityUtils.getImplicitRole(elementQW, pageQW, aName);
  }
  return role;
}

export = getElementRoleAName;
