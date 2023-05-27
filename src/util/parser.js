const puppeteer = require('puppeteer');

/**
 * @type puppeteer.Browser
 */
let browser;
let page;

/**
 * @return {Promise<puppeteer.Browser>}
 */
async function init() {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' +
      'Chrome/58.0.3029.110 Safari/537.36'],
  });
  page = await browser.newPage();
}

/**
 * @return {Promise<void>}
 */
async function parseAll() {
  await init();
  await page.goto('https://ozon.by/category/noutbuki-15692/apple-26303000/',
      {waitUntil: 'domcontentloaded'});
  console.log(await page.title());

  const navButtonsXpath =
    'xpath/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[2]/div/div[1]/div[1]/a[position()<last()]';
  const navButtons = await page.$$(navButtonsXpath);
  console.log(navButtons.length !== 0);
  for (let i = 0; i < navButtons.length; i++) {
    const btn = navButtons[i];
    const url = await btn.evaluate((b) => b.href);
    try {
      const newPage = await browser.newPage();
      await newPage.goto(url, {waitUntil: 'domcontentloaded'});
      // await parsePage(newPage);
      console.log(newPage.url());
      await newPage.close();
    } catch (e) {
      console.error(`Error navigating to ${url}`);
      console.error(e);
    }
  }
  // await Promise.all(
  //     navButtons.map(async (btn) => {
  //       const url = await btn.evaluate((b) => b.href);
  //       try {
  //         const newPage = await browser.newPage();
  //         setTimeout(() => { }, 1000);
  //         await newPage.goto(url, {waitUntil: 'domcontentloaded'});
  //         await parsePage(newPage);
  //         console.log(newPage.url());
  //         await newPage.close();
  //       } catch (e) {
  //         console.error(`Error navigating to ${url}`);
  //         console.error(e);
  //       }
  //     }),
  // );
  await browser.close();
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function parsePage(page) {
  const productsXpath = 'xpath/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div[1]/div/div[*]';
  const titleXpath = 'xpath/div[2]/div[1]/a';
  await page.waitForSelector(productsXpath);
  /**
   * @type puppeteer.ElementHandle[]
   */
  const products = await page.$$(productsXpath);
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const titleEl = await product.waitForSelector(titleXpath, {timeout: 5000});
    const title = await titleEl.evaluate((e) => e.textContent.trim());
    console.log(title);
  }
}

(async () => {
  await parseAll();
})();
