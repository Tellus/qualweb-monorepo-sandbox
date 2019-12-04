const {
  configure,
  executeACTR
} = require('../../dist/index');

const { expect } = require('chai');
const puppeteer = require('puppeteer');
const {
  getDom
} = require('../getDom');

describe('Rule QW-ACT-R9', async function () {

  const tests = [
    {
      url: 'https://act-rules.github.io/testcases/b20e66/6bcc6fc287d6294d5a2562c236c7a065f3bf6d70.html',
      outcome: 'passed'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/80d8153e1068dd38c842bb46d53102f964412b18.html',
      outcome: 'passed'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/31cfe45f40320a5a52d61c3d7fddead260b9fe90.html',
      outcome: 'passed'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/d8d71f30beabfb3b15d0105ccd3276dadd2e34d7.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/23c2bafa0f958b3ddbeffc7637c2d0a77930e243.html',
      outcome: 'passed'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/7cc351939c1442a3d3a0dd1f8fe3724fa7d47861.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/8f3d63dd0bdf7587e80ac323023cf7770123d60b.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/40789454d907bec70811db0c4d172c3eca79a324.html',
      outcome: 'passed'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/3957955737bb33a637f77ca7a689d1b2165a357e.html',
      outcome: 'inapplicable'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/d674c36ef36b5fe2c5d017b9282f0bd9d59696b4.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/1e8797e346ff328dcbfda6387ad0e2c94925ed78.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/4afa0dd83102025acd1e416a6dc5383f1cfc9323.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/d2fb3a2fd2ba4a499da1dd21b687b1152b10688d.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/8aebb19e25c95d391764b1354583fcef8c8fb12e.html',
      outcome: 'inapplicable'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/bee12d37063d8a221ec5f060d3defb0fb1d5acde.html',
      outcome: 'warning'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/9f262eab98d359c36dfa87e3940fc641bca0acd1.html',
      outcome: 'inapplicable'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/f54fd9cd3c7a49cc201d9590649f725cfc4ac07c.html',
      outcome: 'inapplicable'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/406c58de59fc7884d3c6399a8b851f8abe0c57c5.html',
      outcome: 'inapplicable'
    },
    {
      url: 'https://act-rules.github.io/testcases/b20e66/7f72b0d0296a28a282502899f325830ca8487833.html',
      outcome: 'inapplicable'
    }
  ];
  let browser;
  it("", async function () {
    browser = await puppeteer.launch();
  });
  let i = 0;
  let lastOutcome = 'passed';
  for (const test of tests || []) {
    if (test.outcome !== lastOutcome) {
      lastOutcome = test.outcome;
      i = 0;
    }
    i++;
    describe(`${test.outcome.charAt(0).toUpperCase() + test.outcome.slice(1)} example ${i}`, function () {
      it(`should have outcome="${test.outcome}"`, async function () {
        this.timeout(100 * 1000);
        const { sourceHtml, page, stylesheets } = await getDom(browser, test.url);
        configure({ rules: ['QW-ACT-R9'] });
        const report = await executeACTR(sourceHtml, page, stylesheets);

        expect(report.rules['QW-ACT-R9'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }

  describe(``, async function () {
    it(``, async function () {
      await browser.close();
    });
  });
});


/**
 *      const browser = await puppeteer.launch();
 *      const page = await this.browser.newPage();
        await this.setPageViewport(page);

        const plainStylesheets: any = {};
        page.on('response', async response => {
          if(response.request().resourceType() === 'stylesheet') {
            const url = response.url();
            const content = await response.text();
            plainStylesheets[url] = content;
          }
        });

        await page.goto(url, {
          waitUntil: ['networkidle2', 'domcontentloaded']
        });

        const stylesheets = await this.parseStylesheets(plainStylesheets);

        const sourceHtml = await this.getSourceHTML(url);
 */
