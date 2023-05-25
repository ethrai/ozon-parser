const puppeteer = require('puppeteer')
const UserAgent = require('user-agents')
const path = require('path')
const fs = require('fs')
const { writeData, getData, dbClose, getSelections, getSelectionProducts } = require('./database')

let isParsing = true

function sendStop() {
  isParsing = false
}

async function parseAll(event) {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.setUserAgent(UserAgent.toString())
  const pageUrl = 'https://ozon.by/category/noutbuki-15692/apple-26303000/'
  await page.goto(pageUrl, {
    waitUntil: 'domcontentloaded'
  })
  await page.setViewport({ width: 1920, height: 1080 })
  page.setDefaultNavigationTimeout(60 * 1000)
  console.log(await page.title())

  const navButtonsXpath =
    '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[2]/div/div[1]/div[1]/a[position()<last()]'
  const navButtons = await page.$x(navButtonsXpath)
  const navUrls = await Promise.all(
    navButtons.map(async (btn) => {
      return await btn.evaluate((b) => b.href)
    })
  )
  console.log(navUrls)

  for (const navUrl of navUrls.slice(0, 1)) {
    if (!isParsing) {
      console.log('Парсинг остановлен!')
      break
    }
    await page.goto(navUrl, { waitUntil: 'domcontentloaded' })
    await parsePage(page, event)
  }
  await browser.close()
  console.log('Browser closed. Parsing complete')
  if (!isParsing) isParsing = true
}

async function parsePage(page, event) {
  const productXpath =
    '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div[1]/div/div[*]'
  const titleXpath = './div[2]/div/a'
  const priceXpath = './div[3]/div[1]/div[1]'
  const price2Xpath = './div[3]/div[1]/span/span[1]'
  const sellerXpath = './div[3]/div[2]/div/span/span/font'

  await new Promise((resolve) => setTimeout(resolve, 500))

  await page.waitForXPath(productXpath, { timeout: 10000 })
  const products = await page.$x(productXpath)

  await Promise.all(
    products.map(async (product) => {
      await product.waitForSelector('xpath/' + titleXpath)
      const [titleElement] = await product.$$('xpath/' + titleXpath)
      const title = await titleElement.evaluate((e) => e.innerText.trim())
      console.log(title)
      const url = await titleElement.evaluate((e) => e.href)

      let priceElement
      try {
        await product.waitForSelector('xpath/' + priceXpath, { timeout: 2000 })
        priceElement = (await product.$$('xpath/' + priceXpath))[0]
      } catch (e) {
        await product.waitForSelector('xpath/' + price2Xpath)
        priceElement = (await product.$$('xpath/' + price2Xpath))[0]
      }
      let price = await priceElement.evaluate((e) => e.innerText.trim())
      price = parsePrice(price)

      await product.waitForSelector('xpath/' + sellerXpath)
      const [sellerElement] = await product.$$('xpath/' + sellerXpath)
      const seller = await sellerElement.evaluate((e) => e.textContent.trim())

      event.sender.send('retrieve:data', { title, price, seller, url })
      console.log('Product parsed, data shoud\'ve been sent')
    })
  )
}

function parsePrice(price) {
  const regex = /(\d[\d\s,.]*)\s*(BYN)/
  const match = price.match(regex)
  return match[1].replace(/\s/g, '')
}

module.exports = {
  sendStop,
  parseAll
}