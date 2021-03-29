import { ACTRule } from '@qualweb/act-rules';
import AtomicRule from '../lib/AtomicRule.object';
import { ACTRuleDecorator, ElementExists } from '../lib/decorator';
import Test from '../lib/Test.object';

@ACTRuleDecorator
class QW_ACT_R44 extends AtomicRule {
  constructor(rule: ACTRule) {
    super(rule);
  }

  @ElementExists
  execute(element: typeof window.qwElement): void {
    const links = element.getElements('a[href], [role="link"]');
    const linkDataList = new Array<any>();

    for (const link of links || []) {
      let aName, href, context;
      if (window.DomUtils.isElementADescendantOf(link, ['svg'], [])) {
        aName = window.AccessibilityUtils.getAccessibleNameSVG(link);
      } else if (window.AccessibilityUtils.isElementInAT(link)) {
        aName = window.AccessibilityUtils.getAccessibleName(link);
      }
      href = link.getElementAttribute('href');
      context = window.AccessibilityUtils.getLinkContext(link);

      if (aName) {
        linkDataList.push({
          context,
          href,
          aName,
          link
        });
      }
    }

    let counter = 0;
    const blacklist = new Array<number>();
    for (const linkData of linkDataList || []) {
      const test = new Test();

      const elementList = new Array<typeof window.qwElement>();

      if (blacklist.indexOf(counter) >= 0) {
        //element already evaluated
      } else if (!!linkData.aName && linkData.aName !== '') {
        const hasEqualAn = this.isInListExceptIndex(linkData, linkDataList, counter);

        if (hasEqualAn.length > 0) {
          blacklist.push(...hasEqualAn);
          let hasEqualHref = false;
          for (const index of hasEqualAn) {
            hasEqualHref =
              linkDataList[index].href === linkDataList[counter].href && linkDataList[counter].href !== null;
            elementList.push(linkDataList[index].link);
          }
          elementList.push(linkDataList[counter].link);
          if (hasEqualHref) {
            //passed
            test.verdict = 'passed';
            test.description = `The \`links\` with the same accessible name have equal content.`;
            test.resultCode = 'RC2';
          } else {
            //warning
            test.verdict = 'warning';
            test.description = `The \`links\` with the same accessible name have different content. Verify is the content is equivalent.`;
            test.resultCode = 'RC3';
          }

          test.addElements(elementList);
          super.addTestResult(test);
        }
      }

      counter++;
    }
  }
  private isInListExceptIndex(linkData: any, linkDataList: any[], index: number): Array<number> {
    const result = new Array<number>();
    let counter = 0;

    for (const linkDataToCompare of linkDataList || []) {
      if (
        linkDataToCompare.aName === linkData.aName &&
        linkData.context.toString() === linkDataToCompare.context.toString() &&
        counter !== index
      ) {
        result.push(counter);
      }
      counter++;
    }

    return result;
  }
}

export = QW_ACT_R44;
