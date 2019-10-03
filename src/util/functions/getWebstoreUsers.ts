import puppeteer from "puppeteer";

/**
 * Get the usage data of an extension
 * @param {String} id Chrome webstore item id
 */
const getWebstoreUsers = async (): Promise<
  Array<{ users: number; version: string }>
> => {
  var browser = await puppeteer.launch();

  var page = await browser.newPage();
  var res = [await getUsers(page, "agjnjboanicjcpenljmaaigopkgdnihi")];
  await browser.close();
  return res;
};

async function getUsers(page: puppeteer.Page, id: string) {
  //* Go to page
  await page.goto(`https://chrome.google.com/webstore/detail/premid/${id}`, {
    waitUntil: "networkidle0"
  });

  //* Evaluate and return users and version
  return await page.evaluate(() => {
    return {
      users: parseInt(
        document
          .querySelector(".e-f-ih[title]")
          .getAttribute("title")
          .replace(/[\D]/g, "")
      ),
      version: (document.querySelector(
        ".C-b-p-D-Xe.h-C-b-p-D-md"
      ) as HTMLSpanElement).innerText
    };
  });
}

export { getWebstoreUsers };
