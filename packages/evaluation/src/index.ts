import CSSselect from 'css-select';
import { Page } from 'puppeteer';
import { QualwebOptions, SourceHtml, PageOptions, CSSStylesheet, ProcessedHtml, Url } from "@qualweb/core";
import fetch from 'node-fetch';
import { randomBytes } from 'crypto';
import { CSSTechniques } from '@qualweb/css-techniques';
import { BrowserUtils, DomUtils } from '@qualweb/util';
import EvaluationRecord from './evaluationRecord.object';
let endpoint = 'http://194.117.20.242/validate/';


class Evaluation {

    public async getEvaluator(page: Page, sourceHtml: SourceHtml, stylesheets: CSSStylesheet[], url: string) {
        const [plainHtml, pageTitle, elements, browserUserAgent] = await Promise.all([
            page.evaluate(() => {
                return document.documentElement.outerHTML;
            }),
            page.title(),
            page.$$('*'),
            page.browser().userAgent()
        ]);
        let urlStruct;
        if (url) {
            let pageUrl = await page.url();
            urlStruct = this.parseUrl(url, pageUrl)
        }

        const processedHtml: ProcessedHtml = {
            html: {
                plain: plainHtml
            },
            title: pageTitle,
            elementCount: elements.length
        };

        const viewport = page.viewport();

        const evaluator = {
            name: 'QualWeb',
            description: 'QualWeb is an automatic accessibility evaluator for webpages.',
            version: '3.0.0',
            homepage: 'http://www.qualweb.di.fc.ul.pt/',
            date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            hash: randomBytes(40).toString('hex'),
            url: urlStruct,
            page: {
                viewport: {
                    mobile: viewport.isMobile,
                    landscape: viewport.isLandscape,
                    userAgent: browserUserAgent,
                    resolution: {
                        width: viewport.width,
                        height: viewport.height
                    }
                },
                dom: {
                    source: sourceHtml,
                    processed: processedHtml,
                    stylesheets
                }
            }
        };
        return evaluator;

    }
    public async addQWPage(page: Page) {
        await page.addScriptTag({
            path: require.resolve('@qualweb/qw-page').replace('index.js', 'qwPage.js')
        })
    }

    public async executeACT(page: Page, sourceHtml: SourceHtml, stylesheets: CSSStylesheet[], options: QualwebOptions) {
        await page.addScriptTag({
            path: require.resolve('@qualweb/act-rules')
        })
        const metaElements = CSSselect("meta", sourceHtml.html.parsed);
        let parsedMetaElements: any[] = [];
        for (let element of metaElements) {
            const content = DomUtils.getSourceElementAttribute(element, 'content');
            const httpEquiv = DomUtils.getSourceElementAttribute(element, 'http-equiv');
            const htmlCode = DomUtils.getSourceElementHtmlCode(element, true, false);
            const selector = DomUtils.getSourceElementSelector(element);
            parsedMetaElements.push({ content, httpEquiv, htmlCode, selector })
        }
        const actReport = await page.evaluate((parsedMetaElements, stylesheets, options) => {
            // @ts-ignore 
            const act = new ACTRules.ACTRules();
            if (options)
                act.configure(options);
            // @ts-ignore 
            const report = act.execute(parsedMetaElements, new QWPage.QWPage(document), stylesheets);
            return report;
            // @ts-ignore 
        }, parsedMetaElements, stylesheets, options['act-rules']);

        return actReport;

    }

    public async executeHTML(page: Page, options: QualwebOptions) {
        await page.addScriptTag({
            path: require.resolve('@qualweb/html-techniques')
        })
        const url = page.url();
        const urlVal = await page.evaluate(() => {
            return location.href;
        });

        const validationUrl = endpoint + encodeURIComponent(urlVal);

        let response, validation;

        try {
            response = await fetch(validationUrl);
        } catch (err) {
            console.log(err);
        }
        if (response && response.status === 200)
            validation = JSON.parse(await response.json());
        const newTabWasOpen = await BrowserUtils.detectIfUnwantedTabWasOpened(page.browser(), url);
        const htmlReport = await page.evaluate((newTabWasOpen, validation, options) => {
            // @ts-ignore 
            const html = new HTMLTechniques.HTMLTechniques();
            if (options)
                html.configure(options)
            // @ts-ignore 
            const report = html.execute(new QWPage.QWPage(document), newTabWasOpen, validation);
            return report;
            // @ts-ignore 
        }, newTabWasOpen, validation, options['html-techniques']);
        return htmlReport;

    }
    public async executeCSS(stylesheets: CSSStylesheet[], mappedDOM: any, options: QualwebOptions) {
        const css = new CSSTechniques();
        if (options['css-techniques']) {
            css.configure(options['css-techniques']);
        }
        let result = await css.execute(stylesheets, mappedDOM);
        css.resetConfiguration();
        return result;
    }

    public async executeBP(page: Page, options: QualwebOptions) {
        await page.addScriptTag({
            path: require.resolve('@qualweb/best-practices')
        })
        const bpReport = await page.evaluate((options) => {
            // @ts-ignore 
            const bp = new BestPractices.BestPractices();
            if (options)
                bp.configure(options)
            // @ts-ignore 
            const report = bp.execute(new QWPage.QWPage(document));
            return report;
        }, options['best-practices']);
        return bpReport;

    }

    public async evaluatePage(sourceHtml: SourceHtml, page: Page, stylesheets: CSSStylesheet[], mappedDOM: any, execute: any, options: QualwebOptions, url: string): Promise<EvaluationRecord> {


        let evaluator = await this.getEvaluator(page, sourceHtml, stylesheets, url);
        const evaluation = new EvaluationRecord(evaluator);

        const reports = new Array<any>();
        await this.addQWPage(page);


        if (execute.act) {
            reports.push(await this.executeACT(page, sourceHtml, stylesheets, options));
        }

        if (execute.html) {
            reports.push(await this.executeHTML(page, options));
        }
        if (execute.css) {
            reports.push(await this.executeCSS(stylesheets, mappedDOM, options));
        }
        if (execute.bp) {
            reports.push(await this.executeBP(page, options));
        }


        for (const report of reports || []) {
            if (report.type === 'wappalyzer') {
                evaluation.addModuleEvaluation('wappalyzer', report);
            } else if (report.type === 'act-rules') {
                evaluation.addModuleEvaluation('act-rules', report);
            } else if (report.type === 'html-techniques') {
                evaluation.addModuleEvaluation('html-techniques', report);
            } else if (report.type === 'css-techniques') {
                evaluation.addModuleEvaluation('css-techniques', report);
            } else if (report.type === 'best-practices') {
                evaluation.addModuleEvaluation('best-practices', report);
            }
        }

        return evaluation;
    }
    private parseUrl(url: string, pageUrl: string): Url {
        let inputUrl = url;
        let protocol: string;
        let domainName: string;
        let domain: string;
        let uri: string;
        let completeUrl = pageUrl;

        protocol = completeUrl.split('://')[0];
        domainName = completeUrl.split('/')[2];

        const tmp = domainName.split('.');
        domain = tmp[tmp.length - 1];
        uri = completeUrl.split('.' + domain)[1];

        const parsedUrl = {
            inputUrl,
            protocol,
            domainName,
            domain,
            uri,
            completeUrl
        };

        return parsedUrl;
    }
}


export { Evaluation ,EvaluationRecord}


