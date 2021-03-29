import { WCAGTechnique } from '@qualweb/wcag-techniques';
import Technique from '../lib/Technique.object';
import {
  WCAGTechniqueClass,
  ElementExists,
  ElementHasAttributes,
  ElementHasAccessibleName
} from '../lib/applicability';
import Test from '../lib/Test.object';

@WCAGTechniqueClass
class QW_WCAG_T8 extends Technique {
  private readonly default_title = ['spacer', 'image', 'picture', 'separador', 'imagem', 'fotografia'];

  private readonly pattern = new RegExp('.+\\.(jpg|jpeg|png|gif|tiff|bmp)');
  private readonly pattern1 = new RegExp('^picture\\s[0-9]+$');
  private readonly pattern2 = new RegExp('^[0-9]+$');
  private readonly pattern3 = new RegExp('^intro#[0-9]+$');
  private readonly pattern4 = new RegExp('^imagem\\s[0-9]+$');

  constructor(technique: WCAGTechnique) {
    super(technique);
  }

  @ElementExists
  @ElementHasAttributes
  @ElementHasAccessibleName
  execute(element: typeof window.qwElement): void {
    const test = new Test();

    const accessibleName = (<string>window.AccessibilityUtils.getAccessibleName(element)).toLocaleLowerCase();

    if (
      !this.pattern4.test(accessibleName) &&
      !this.pattern3.test(accessibleName) &&
      !this.pattern2.test(accessibleName) &&
      !this.pattern1.test(accessibleName) &&
      !this.pattern.test(accessibleName) &&
      !this.default_title.includes(accessibleName)
    ) {
      test.verdict = 'warning';
      test.description = `Text alternative needs manual verification`;
      test.resultCode = 'RC1';
    } else {
      test.verdict = 'failed';
      test.description = 'Text alternative is not actually a text alternative for the non-text content';
      test.resultCode = 'RC2';
    }

    test.addElement(element);
    super.addTestResult(test);
  }
}

export = QW_WCAG_T8;
