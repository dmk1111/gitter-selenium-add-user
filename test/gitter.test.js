const { describe, it, after, before } = require('mocha');
const Page = require('../lib/basePage');
const locator = require('../utils/locator');

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const creds = {
    login: process.env.GITHUB_LOGIN,
    pass: process.env.GITHUB_PASSWORD
};

const chatLink = 'https://gitter.im/'; // change this to your private chat link
const userName = 'test'; // user, that should be added to chat

process.on('unhandledRejection', (err) => {console.warn('unhandledRejection ' + err)});

(async function example() {
    try {
        describe ('Gitter', async function () {
            this.timeout(500000);
            let driver, page;

            before(async () => {
                page = new Page();
                driver = page.driver;
                await page.visit('https://gitter.im/');
            });

            after(async () => {
                await page.quit();
            });

            it ('login', async () => {
                driver.sleep(10000);
                const signInInitial = await page.findByCss(locator.Gitter.signInInitial);
                await signInInitial.click();
                console.warn('signInInitial clicked');
                driver.sleep(10000);
                const signInGitHub = await page.findByCss(locator.Gitter.signInGitHub);
                await signInGitHub.click();
                console.warn('signInGitHub clicked');
                driver.sleep(30000);
                const url = await page.driver.getCurrentUrl();
                console.warn(url);
                const loginField = await page.findByCss(locator.GitHub.loginField);
                const passwordField = await page.findByCss(locator.GitHub.passwordField);
                const signIn = await page.findByCss(locator.GitHub.signInButton);
                await page.write(loginField, creds.login);
                driver.sleep(10000);
                await page.write(passwordField, creds.pass);
                driver.sleep(10000);
                await signIn.click();
                try {
                    console.warn('checking if need to confirm auth for github');
                    const authBtn = await page.findByCss(locator.GitHub.authorizeApp);
                    driver.sleep(10000);
                    if (authBtn) {
                        console.warn('!!!! Please, sign in to Gitter manually !!!!');
                        await authBtn.click();
                        driver.sleep(10000);
                    }
                } catch (e) {
                    console.warn('not needed :)');
                    console.warn(e);
                }
            });

            it ('add user to group', async () => {
                driver.sleep(10000);
                let url = await page.driver.getCurrentUrl();
                console.warn(url);
                await page.visit(chatLink);
                driver.sleep(10000);
                url = await page.driver.getCurrentUrl();
                console.warn(url);
                console.warn('switch to #content-frame iframe');
                await page.switchToFrame(0);
               await addPersonToRoom(userName);
                console.warn('search for chat textarea');
                const chatInput = await page.findByCss(locator.Gitter.chat.textArea);
                console.warn('send message');
                await page.write(chatInput, 'hello from selenium webdriver!\n');
                driver.sleep(30000);
            });
        });
    } catch (ex) {
        console.log (new Error(ex.message));
    } finally {

    }
})();

async function addPersonToRoom(github, page) {
    console.warn('search for add button');
    const addBtn = await page.findByCss(locator.Gitter.add.buttonAdd);
    console.warn('click add button');
    await addBtn.click();
    console.warn('search for input field');
    const addPeopleInput = await page.findByCss(locator.Gitter.add.peopleInput);
    console.warn('add user ' + github);
    await page.write(addPeopleInput, github);
    driver.sleep(30000);
    const fistAvailable = await page.findByCss(locator.Gitter.add.selectFirstItem);
    driver.sleep(30000);
    await fistAvailable.click();
    driver.sleep(30000);
    console.warn('search for close button');
    const closeBtn = await page.findByCss(locator.Gitter.add.closeModal);
    console.warn('click close button');
    await closeBtn.click();
    await page.waitForDisappear(locator.Gitter.add.overlay);
}