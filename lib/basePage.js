const { Builder, By, until, Key, Condition } = require("selenium-webdriver");

const chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;

const service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

until.elementIsNotPresent = function elementIsNotPresent(locator) {
    return new Condition("for no element to be located " + locator, function(driver) {
        return driver.findElements(locator).then(function(elements) {
            return elements.length == 0;
        });
    });
};

let o = new chrome.Options();
o.addArguments("start-fullscreen");
o.addArguments("disable-infobars");
o.addArguments("--disable-notifications");
// o.addArguments('headless'); // running test on visual chrome browser
o.setUserPreferences({ credential_enable_service: false });

const Page = function() {

    this.driver = new Builder()
        .setChromeOptions(o)
        .forBrowser("chrome")
        .build();

    // visit a webpage
    this.visit = async function(theUrl) {
        return await this.driver.get(theUrl);
    };

    // quit current session
    this.quit = async function() {
        return await this.driver.quit();
    };

    // wait and find a specific element with it's id
    this.findById = async function(id) {
        await this.driver.wait(until.elementLocated(By.id(id)), 15000, "Looking for element");
        return await this.driver.findElement(By.id(id));
    };

    // wait and find a specific element with it's name
    this.findByName = async function(name) {
        await this.driver.wait(until.elementLocated(By.name(name)), 15000, "Looking for element");
        return await this.driver.findElement(By.name(name));
    };

    this.findByCss = async function(selector) {
        await this.driver.wait(until.elementLocated(By.css(selector)), 15000, "Looking for element");
        return await this.driver.findElement(By.css(selector));
    };

    this.switchToFrame = async function(frame) {
        this.driver.wait(until.elementLocated(By.css('iframe')), 15000, 'Looking for iframe');
        return await this.driver.switchTo().frame(frame);
    };

    this.waitForDisappear = async function(selector) {
        try {
            const element = await this.driver.findElement(By.css(selector));
            await this.driver.wait(until.elementIsNotVisible(element), 30000, "Waiting for element to hide");
        } catch (e) {
            console.warn('Element disappeared');
        }
    };

    // fill input web elements
    this.write = async function(el, txt) {
        return await el.sendKeys(txt);
    };

    this.pressEnter = async function(el) {
        return await el.sendKeys(Key.ENTER);
    };


};

module.exports = Page;