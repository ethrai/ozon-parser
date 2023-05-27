const puppeteer = require('puppeteer')
const UserAgent = require('user-agents')
const path = require('path')
const fs = require('fs')
const { writeData, getData, dbClose, getSelections, getSelectionProducts } = require('./database')

let isParsing = true

function sendStop() {
  isParsing = false
}

let currentProductCount = 0
let page
let browser

async function parseAll(event) {
  browser = await puppeteer.launch({ headless: "new" })
  page = await browser.newPage()
  await page.setUserAgent(UserAgent.toString())
  const url = ''
  await page.setViewport({ width: 1920, height: 1080 })
  page.setDefaultNavigationTimeout(60 * 1000)
  await page.goto('https://ozon.by/category/noutbuki-15692/apple-26303000/', {
    waitUntil: 'domcontentloaded'
  })
  // TODO: rempve log
  console.log(await page.title())
  const navButtonsXpath =
    '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[2]/div/div[1]/div[1]/a[position()<last()]'
  const navButtons = await page.$x(navButtonsXpath)
  await Promise.all(
    navButtons.map(async (btn) => {
      const url = await btn.evaluate((b) => b.href)
      console.log(`starting ${url}`)
      await parsePage(event, url)
    })
  )

  await browser.close()
  console.log('Browser closed. Parsing complete')
  if (!isParsing) isParsing = true
}


/**
 * 
 * @param {Electron.IpcMainEvent} event 
 */
async function parsePage(event, url) {
  await page.goto(url)
  console.log("Ему вообще похуй")
  const productXpath = 'xpath/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div[1]/div/div[*]'
  const pseudo = '::-p-xpath(html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div[1]/div/div[*])'
  const titleSelector = 'div:nth-of-type(2) > div > a'
  const products = await page.$$(pseudo)

  const titleXpath = '::-p-xpath(/div[2]/div/a)'

  let i = 0
  await Promise.all(products.map(async (product) => {
    console.log(`${i++}`);
  }))


  // const titleXpath = '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div/div/div[*]/div[2]/div/a'
  // const priceXpath = '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div/div/div[*]/div[3]/div[1]/div[1]'
  // const price2Xpath = '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div/div/div[*]/div[3]/div[1]/span/span[1]'
  // const sellerXpath = '/html/body/div[1]/div/div[1]/div[2]/div[2]/div[2]/div[3]/div[1]/div[1]/div/div[*]/div[3]/div[2]/div/span/span/font'

  // await new Promise((resolve) => setTimeout(resolve, 500))

  // await page.waitForXPath(productChromiumXpath, { timeout: 10000 })
  // const products = await page.$x(productChromiumXpath)

  // await Promise.all(
  //   products.map(async (product) => {
  //     await product.waitForSelector('xpath/' + titleXpath)
  //     const [titleElement] = await product.$$('xpath/' + titleXpath)
  //     const title = await titleElement.evaluate((e) => e.innerText.trim())
  //     const url = await titleElement.evaluate((e) => e.href)

  //     let priceElement
  //     try {
  //       await product.waitForSelector('xpath/' + priceXpath, { timeout: 2000 })
  //       priceElement = (await product.$$('xpath/' + priceXpath))[0]
  //     } catch (e) {
  //       await product.waitForSelector('xpath/' + price2Xpath)
  //       priceElement = (await product.$$('xpath/' + price2Xpath))[0]
  //     }
  //     let price = await priceElement.evaluate((e) => e.innerText.trim())
  //     price = parsePrice(price)

  //     await product.waitForSelector('xpath/' + sellerXpath)
  //     const [sellerElement] = await product.$$('xpath/' + sellerXpath)
  //     const seller = await sellerElement.evaluate((e) => e.textContent.trim())
  //     currentProductCount++

  //     event.sender.send('retrieve:data', { number: currentProductCount, title, price, seller, url })
  //     console.log(`${currentProductCount} parsed`)
  //   })
  // )
}

function parsePrice(price) {
  const regex = /(\d[\d\s,.]*)\s*(BYN)/
  const match = price.match(regex)
  return match[1].replace(/\s/g, '')
}

(async () => {
  await parseAll(null)
})()

module.exports = {
  sendStop,
  parseAll
}