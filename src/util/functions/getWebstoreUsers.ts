import axios from "axios";

const USERS_REGEX = /class="e-f-ih" title="([\d,]+) users"/;
const NOT_NUMBER_REGEX = /[^\d]/g;

interface WhateverOriginResponse {
  contents: string;
  status: {
    url: string;
    content_type: string;
    http_code: number;
  };
}

/**
 * Get the usage data of an extension
 * @param {String} id Chrome webstore item id
 */
const getWebstoreUsers = async (id: string): Promise<number> => {
  const {
    data: {
      contents,
      status: { http_code },
    },
  } = await axios.get<WhateverOriginResponse>(
    `http://www.whateverorigin.org/get?url=${encodeURIComponent(
      `https://chrome.google.com/webstore/detail/premid/${id}`,
    )}`
  );

  if (http_code < 200 || http_code > 308) {
    throw new Error(`Response http status code: ${http_code}`);
  }

  const string = contents.match(USERS_REGEX).shift();
  return parseInt(string.replace(NOT_NUMBER_REGEX, ""), 10);
};

export { getWebstoreUsers };
